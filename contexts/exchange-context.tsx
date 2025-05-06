"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Connection, PublicKey } from "@solana/web3.js"
import { getExchangeService, type SwapQuote } from "../services/exchange-service"
import { TOKEN_REGISTRY, getAllTokenBalances, updateTokenPrice, calculateUsdValue } from "../utils/token-utils"
import { getCryptoPrice } from "../utils/crypto-price"

// Interface for token balance
export interface TokenBalance {
  symbol: string
  name: string
  balance: number
  usdValue: number
  logoURI: string
}

// Interface for the exchange context
interface ExchangeContextType {
  // Token balances
  tokenBalances: TokenBalance[]
  totalBalanceUsd: number

  // Swap functionality
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  slippageTolerance: number
  swapQuote: SwapQuote | null
  priceImpact: number
  swapError: string | null

  // Loading states
  isLoadingBalances: boolean
  isLoadingQuote: boolean
  isExecutingSwap: boolean

  // Functions
  setFromToken: (symbol: string) => void
  setToToken: (symbol: string) => void
  setFromAmount: (amount: string) => void
  setToAmount: (amount: string) => void
  setSlippageTolerance: (tolerance: number) => void
  refreshBalances: () => Promise<void>
  executeSwap: () => Promise<string | null>

  // Exchange info
  supportedTokens: string[]
  exchangeRate: number | null
}

// Create the context
const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined)

// Provider props
interface ExchangeProviderProps {
  children: ReactNode
  connection: Connection
  wallet: PublicKey | null
  signTransaction: ((transaction: any) => Promise<any>) | null
}

// Exchange provider component
export function ExchangeProvider({ children, connection, wallet, signTransaction }: ExchangeProviderProps) {
  // Token balances
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [totalBalanceUsd, setTotalBalanceUsd] = useState<number>(0)
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false)

  // Swap state
  const [fromToken, setFromToken] = useState<string>("SOL")
  const [toToken, setToToken] = useState<string>("MUTB")
  const [fromAmount, setFromAmount] = useState<string>("1")
  const [toAmount, setToAmount] = useState<string>("")
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5) // 0.5%
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false)
  const [isExecutingSwap, setIsExecutingSwap] = useState<boolean>(false)
  const [swapError, setSwapError] = useState<string | null>(null)

  // Exchange info
  const [supportedTokens, setSupportedTokens] = useState<string[]>(Object.keys(TOKEN_REGISTRY))
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)

  // Get the exchange service
  const exchangeService = getExchangeService(connection)

  // Fetch token prices
  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        // Fetch SOL price
        const solPrice = await getCryptoPrice("solana")
        updateTokenPrice("SOL", solPrice)

        // MUTB price is fixed at $1.00
        updateTokenPrice("MUTB", 1.0)

        // Refresh balances to update USD values
        if (wallet) {
          refreshBalances()
        }
      } catch (error) {
        console.error("Error fetching token prices:", error)
      }
    }

    fetchTokenPrices()

    // Refresh prices every 60 seconds
    const interval = setInterval(fetchTokenPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch token balances when wallet changes
  useEffect(() => {
    if (wallet) {
      refreshBalances()
    } else {
      setTokenBalances([])
      setTotalBalanceUsd(0)
    }
  }, [wallet])

  // Update swap quote when inputs change
  useEffect(() => {
    updateSwapQuote()
  }, [fromToken, toToken, fromAmount, slippageTolerance])

  // Refresh token balances
  const refreshBalances = async () => {
    if (!wallet) return

    setIsLoadingBalances(true)

    try {
      // Get all token balances
      const balances = await getAllTokenBalances(connection, wallet)

      // Convert to TokenBalance objects
      const tokenBalanceObjects: TokenBalance[] = []
      let totalUsd = 0

      for (const [symbol, balance] of Object.entries(balances)) {
        const tokenInfo = TOKEN_REGISTRY[symbol]
        if (!tokenInfo) continue

        const usdValue = calculateUsdValue(balance, symbol)
        totalUsd += usdValue

        tokenBalanceObjects.push({
          symbol,
          name: tokenInfo.name,
          balance,
          usdValue,
          logoURI: tokenInfo.logoURI,
        })
      }

      // Sort by USD value (descending)
      tokenBalanceObjects.sort((a, b) => b.usdValue - a.usdValue)

      setTokenBalances(tokenBalanceObjects)
      setTotalBalanceUsd(totalUsd)
    } catch (error) {
      console.error("Error refreshing balances:", error)
    } finally {
      setIsLoadingBalances(false)
    }
  }

  // Update the swap quote
  const updateSwapQuote = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setSwapQuote(null)
      setToAmount("")
      setExchangeRate(null)
      return
    }

    setIsLoadingQuote(true)

    try {
      // Get a swap quote
      const quote = await exchangeService.getSwapQuote({
        fromToken,
        toToken,
        amount: Number.parseFloat(fromAmount),
        slippageTolerance,
      })

      setSwapQuote(quote)
      setToAmount(quote.outputAmount.toString())
      setExchangeRate(quote.exchangeRate)
    } catch (error) {
      console.error("Error getting swap quote:", error)
      setSwapQuote(null)
      setToAmount("")
      setExchangeRate(null)
    } finally {
      setIsLoadingQuote(false)
    }
  }

  // Execute a swap
  const executeSwap = async (): Promise<string | null> => {
    if (!wallet || !signTransaction || !swapQuote) return null

    setIsExecutingSwap(true)
    setSwapError(null)

    try {
      // Execute the swap
      const txid = await exchangeService.executeSwap(
        {
          fromToken,
          toToken,
          amount: Number.parseFloat(fromAmount),
          slippageTolerance,
        },
        wallet,
        signTransaction,
      )

      // Refresh balances after swap
      await refreshBalances()

      return txid
    } catch (error) {
      console.error("Error executing swap:", error)
      setSwapError(error instanceof Error ? error.message : "Unknown error occurred")
      return null
    } finally {
      setIsExecutingSwap(false)
    }
  }

  // Calculate price impact
  const priceImpact = swapQuote ? swapQuote.priceImpact : 0

  // Context value
  const value: ExchangeContextType = {
    tokenBalances,
    totalBalanceUsd,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippageTolerance,
    swapQuote,
    priceImpact,
    swapError,
    isLoadingBalances,
    isLoadingQuote,
    isExecutingSwap,
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setSlippageTolerance,
    refreshBalances,
    executeSwap,
    supportedTokens,
    exchangeRate,
  }

  return <ExchangeContext.Provider value={value}>{children}</ExchangeContext.Provider>
}

// Hook to use the exchange context
export function useExchange() {
  const context = useContext(ExchangeContext)
  if (context === undefined) {
    throw new Error("useExchange must be used within an ExchangeProvider")
  }
  return context
}
