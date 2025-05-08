"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeftRight,
  TrendingUp,
  ArrowDownUp,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Settings,
} from "lucide-react"
import Image from "next/image"
import { type Connection, PublicKey, Transaction } from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { createJupiterApiClient, type JupiterQuoteResponse } from "@/utils/jupiter-sdk"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// IMPORTANT: Disable mock implementation completely
const USE_MOCK = false

// MUTB token mint address on devnet
const MUTB_MINT_ADDRESS = "BKc4wfcYXm8Eky71EoeAmKuao7zY1dhiJgYaQUAEVGyG"
// SOL mint address (wrapped SOL)
const SOL_MINT_ADDRESS = "So11111111111111111111111111111111111111112"

// Declare LAMPORTS_PER_SOL
const LAMPORTS_PER_SOL = 1000000000

interface MutableMarketplaceProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
  onBalanceChange?: (currency: "sol" | "mutb", newBalance: number) => void
}

// Function to fetch real-time crypto price from CoinGecko API
const getCryptoPrice = async (coinId: string): Promise<number> => {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`)
    const data = await response.json()
    if (data && data[coinId] && data[coinId].usd) {
      return data[coinId].usd
    } else {
      throw new Error(`Could not fetch price for ${coinId}`)
    }
  } catch (error) {
    console.error("Error fetching crypto price:", error)
    throw error
  }
}

export default function MutableMarketplace({
  publicKey,
  balance,
  provider,
  connection,
  onBalanceChange,
}: MutableMarketplaceProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("swap")
  const [mutbBalance, setMutbBalance] = useState<number>(100) // Mock MUTB balance
  const [swapAmount, setSwapAmount] = useState<string>("1")
  const [swapDirection, setSwapDirection] = useState<"sol-to-mutb" | "mutb-to-sol">("sol-to-mutb")

  // Replace the static exchange rate with state variables
  const [solPrice, setSolPrice] = useState<number | null>(null)
  const [mutbPrice, setMutbPrice] = useState<number>(0.1) // Fixed at $0.10
  const [exchangeRate, setExchangeRate] = useState<number>(10000)
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false)
  const [isSwapping, setIsSwapping] = useState<boolean>(false)
  const [swapError, setSwapError] = useState<string | null>(null)
  const [mutbTokenAccount, setMutbTokenAccount] = useState<string | null>(null)

  // Jupiter quote state
  const [jupiterQuote, setJupiterQuote] = useState<JupiterQuoteResponse | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false)
  const [slippageBps, setSlippageBps] = useState<number>(50) // 0.5% default slippage
  const [jupiterClient, setJupiterClient] = useState<any>(null)
  const [isTokenTradable, setIsTokenTradable] = useState<boolean>(false)
  const [checkingTradability, setCheckingTradability] = useState<boolean>(true)

  // Transaction history
  const [transactionHistory, setTransactionHistory] = useState<
    Array<{
      type: "swap" | "pool"
      timestamp: number
      inputAmount: number
      inputToken: string
      outputAmount: number
      outputToken: string
      txId: string
    }>
  >([])

  // Initialize Jupiter client
  useEffect(() => {
    if (connection) {
      const client = createJupiterApiClient(connection)
      setJupiterClient(client)

      // Check if token is tradable
      const checkTokenTradability = async () => {
        setCheckingTradability(true)
        try {
          const tradable = await client.isTokenTradable(SOL_MINT_ADDRESS, MUTB_MINT_ADDRESS)
          console.log("Token tradability check result:", tradable)
          setIsTokenTradable(tradable)
        } catch (error) {
          console.error("Error checking token tradability:", error)
          setIsTokenTradable(false)
        } finally {
          setCheckingTradability(false)
        }
      }

      checkTokenTradability()

      // Load transaction history from localStorage
      try {
        const savedHistory = localStorage.getItem("mutb_transaction_history")
        if (savedHistory) {
          setTransactionHistory(JSON.parse(savedHistory))
        }
      } catch (error) {
        console.error("Error loading transaction history:", error)
      }
    }
  }, [connection])

  // Save transaction history to localStorage when it changes
  useEffect(() => {
    if (transactionHistory.length > 0) {
      try {
        localStorage.setItem("mutb_transaction_history", JSON.stringify(transactionHistory))
      } catch (error) {
        console.error("Error saving transaction history:", error)
      }
    }
  }, [transactionHistory])

  // Fetch MUTB token account and balance
  useEffect(() => {
    const fetchTokenAccount = async () => {
      if (!publicKey) return

      try {
        // Create PublicKey instance safely
        let userPublicKey: PublicKey
        try {
          // Check if publicKey is a valid string before creating PublicKey
          if (typeof publicKey !== "string" || !publicKey.trim()) {
            console.log("Invalid or empty public key string")
            return
          }
          userPublicKey = new PublicKey(publicKey)
        } catch (error) {
          console.error("Invalid public key:", error)
          return
        }

        // Create MUTB mint PublicKey safely
        let mutbMint: PublicKey
        try {
          mutbMint = new PublicKey(MUTB_MINT_ADDRESS)
        } catch (error) {
          console.error("Invalid MUTB mint address:", error)
          return
        }

        // Only fetch real token accounts
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userPublicKey, {
            programId: TOKEN_PROGRAM_ID,
          })

          // Find MUTB token account
          const mutbAccount = tokenAccounts.value.find(
            (account) => account.account.data.parsed.info.mint === MUTB_MINT_ADDRESS,
          )

          if (mutbAccount) {
            setMutbTokenAccount(mutbAccount.pubkey.toString())
            const balance = mutbAccount.account.data.parsed.info.tokenAmount.uiAmount
            setMutbBalance(balance)
            console.log("Found MUTB token account with balance:", balance)
          } else {
            // No existing token account found
            setMutbTokenAccount(null)
            setMutbBalance(0)
            console.log("No MUTB token account found, balance set to 0")
          }
        } catch (error) {
          console.error("Error fetching token accounts:", error)
          setMutbTokenAccount(null)
          setMutbBalance(0)
        }
      } catch (error) {
        console.error("Error in fetchTokenAccount:", error)
      }
    }

    const fetchExchangeRate = async () => {
      setIsLoadingPrice(true)
      try {
        // Fetch real-time SOL price from CoinGecko API
        const solPriceValue = await getCryptoPrice("solana")
        setSolPrice(solPriceValue)

        // MUTB is fixed at $0.10
        const mutbPriceValue = 0.1
        setMutbPrice(mutbPriceValue)

        // Calculate exchange rate based on real prices
        // Exchange rate = SOL price / MUTB price
        const rate = solPriceValue / mutbPriceValue
        setExchangeRate(rate)
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error)
        // Fallback to default values
        setExchangeRate(10000) // 10,000 MUTB per SOL
        setSolPrice(100) // $100 per SOL
        setMutbPrice(0.1) // $0.10 per MUTB
      } finally {
        setIsLoadingPrice(false)
      }
    }

    fetchExchangeRate()

    // Refresh rate every 60 seconds
    const intervalId = setInterval(fetchExchangeRate, 60000)

    if (publicKey) {
      fetchTokenAccount()
    }

    return () => clearInterval(intervalId)
  }, [publicKey, connection])

  // Function to find or create associated token account
  const findOrCreateAssociatedTokenAccount = async (
    connection: Connection,
    payer: PublicKey,
    mint: PublicKey,
    owner: PublicKey,
  ) => {
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )

    try {
      // Check if the account exists
      await connection.getTokenAccountBalance(associatedTokenAddress)
      return associatedTokenAddress
    } catch (error) {
      // Account doesn't exist, create it
      if (!provider) throw new Error("Wallet provider not connected")

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer,
          associatedTokenAddress,
          owner,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      )

      transaction.feePayer = payer
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

      try {
        const signedTransaction = await provider.signTransaction(transaction)
        const signature = await connection.sendRawTransaction(signedTransaction.serialize())
        await connection.confirmTransaction(signature)
        return associatedTokenAddress
      } catch (error) {
        console.error("Error creating token account:", error)
        throw error
      }
    }
  }

  // Get Jupiter quote
  const getJupiterQuote = async () => {
    if (!jupiterClient || !publicKey || !isTokenTradable) return

    setIsLoadingQuote(true)
    setSwapError(null)

    try {
      const amount = Number.parseFloat(swapAmount)
      if (isNaN(amount) || amount <= 0) {
        setSwapError("Please enter a valid amount")
        setIsLoadingQuote(false)
        return
      }

      // Convert to the smallest unit based on decimals
      // SOL has 9 decimals, assuming MUTB also has 9
      const inputDecimals = 9
      const amountInSmallestUnit = Math.floor(amount * Math.pow(10, inputDecimals))

      const inputMint = swapDirection === "sol-to-mutb" ? SOL_MINT_ADDRESS : MUTB_MINT_ADDRESS
      const outputMint = swapDirection === "sol-to-mutb" ? MUTB_MINT_ADDRESS : SOL_MINT_ADDRESS

      console.log(`Getting Jupiter quote for ${amount} ${swapDirection === "sol-to-mutb" ? "SOL" : "MUTB"}`)
      const quote = await jupiterClient.getQuote(
        inputMint,
        outputMint,
        amountInSmallestUnit,
        slippageBps,
        false, // Allow indirect routes
      )

      setJupiterQuote(quote)

      // Update the exchange rate based on the quote
      if (quote) {
        const inAmount = Number.parseFloat(quote.inAmount) / Math.pow(10, inputDecimals)
        const outAmount = Number.parseFloat(quote.outAmount) / Math.pow(10, inputDecimals)
        const quoteRate = outAmount / inAmount

        if (swapDirection === "sol-to-mutb") {
          setExchangeRate(quoteRate)
        } else {
          setExchangeRate(1 / quoteRate)
        }
      }
    } catch (error) {
      console.error("Error getting Jupiter quote:", error)
      setSwapError("Failed to get quote. Please try again.")
    } finally {
      setIsLoadingQuote(false)
    }
  }

  // Effect to get quote when amount or direction changes
  useEffect(() => {
    if (jupiterClient && publicKey && isTokenTradable) {
      const timer = setTimeout(() => {
        getJupiterQuote()
      }, 500) // Debounce

      return () => clearTimeout(timer)
    }
  }, [swapAmount, swapDirection, jupiterClient, publicKey, slippageBps, isTokenTradable])

  const handleSwap = async () => {
    setSwapError(null)
    setIsSwapping(true)

    try {
      // Check if token is tradable
      if (!isTokenTradable) {
        setSwapError("Token is not tradable on Jupiter yet. Please wait for it to be indexed.")
        setIsSwapping(false)
        return
      }

      const amount = Number.parseFloat(swapAmount)
      if (isNaN(amount) || amount <= 0) {
        setSwapError("Please enter a valid amount")
        setIsSwapping(false)
        return
      }

      if (!provider) {
        setSwapError("Wallet not connected")
        setIsSwapping(false)
        return
      }

      // Check balances
      if (swapDirection === "sol-to-mutb") {
        if (balance !== null && amount > balance) {
          setSwapError("Insufficient SOL balance")
          setIsSwapping(false)
          return
        }
      } else {
        if (amount > mutbBalance) {
          setSwapError("Insufficient MUTB balance")
          setIsSwapping(false)
          return
        }
      }

      // Use Jupiter for real swaps
      if (!jupiterQuote) {
        await getJupiterQuote()
        if (!jupiterQuote) {
          setSwapError("Failed to get quote. Please try again.")
          setIsSwapping(false)
          return
        }
      }

      try {
        // Get the swap transaction
        const swapResponse = await jupiterClient.getSwapTransaction(jupiterQuote, publicKey)

        // Execute the swap
        const swapResult = await jupiterClient.executeSwap(
          swapResponse.swapTransaction,
          new PublicKey(publicKey),
          provider.signTransaction.bind(provider),
          jupiterQuote,
        )

        console.log("Jupiter swap completed:", swapResult)

        // Update balances
        // We should refetch the actual balances, but for now we'll estimate
        const outAmount = Number.parseFloat(jupiterQuote.outAmount) / 1e9 // Assuming 9 decimals

        if (swapDirection === "sol-to-mutb") {
          // Don't update the UI balance - let it be refreshed from chain
          // setMutbBalance(mutbBalance + outAmount)

          // Add to transaction history
          setTransactionHistory((prev) => [
            {
              type: "swap",
              timestamp: Date.now(),
              inputAmount: amount,
              inputToken: "SOL",
              outputAmount: outAmount,
              outputToken: "MUTB",
              txId: swapResult.txid,
            },
            ...prev.slice(0, 9), // Keep only the 10 most recent transactions
          ])

          // Don't update parent balance - let it refresh from chain
          // if (onBalanceChange && balance !== null) {
          //   onBalanceChange("sol", balance - amount)
          // }
        } else {
          // Don't update the UI balance - let it be refreshed from chain
          // setMutbBalance(mutbBalance - amount)

          // Add to transaction history
          setTransactionHistory((prev) => [
            {
              type: "swap",
              timestamp: Date.now(),
              inputAmount: amount,
              inputToken: "MUTB",
              outputAmount: outAmount,
              outputToken: "SOL",
              txId: swapResult.txid,
            },
            ...prev.slice(0, 9), // Keep only the 10 most recent transactions
          ])

          // Don't update parent balance - let it refresh from chain
          // if (onBalanceChange && balance !== null) {
          //   onBalanceChange("sol", balance + outAmount)
          // }
        }

        // Show success toast
        toast({
          title: "Swap Successful!",
          description: `You swapped ${amount} ${swapDirection === "sol-to-mutb" ? "SOL" : "MUTB"} for ${outAmount.toFixed(swapDirection === "sol-to-mutb" ? 2 : 4)} ${swapDirection === "sol-to-mutb" ? "MUTB" : "SOL"}`,
          variant: "default",
          className: "border-2 border-black bg-[#FFD54F] text-black font-mono",
          action: (
            <ToastAction altText="OK" className="border border-black">
              OK
            </ToastAction>
          ),
        })

        // Reset the form
        setSwapAmount("1")
        setJupiterQuote(null)

        // Refresh balances after swap
        if (publicKey) {
          try {
            // Refresh SOL balance
            const solBalance = await connection.getBalance(new PublicKey(publicKey))
            if (onBalanceChange) {
              onBalanceChange("sol", solBalance / LAMPORTS_PER_SOL)
            }

            // Refresh MUTB balance
            const userPublicKey = new PublicKey(publicKey)
            const mutbMint = new PublicKey(MUTB_MINT_ADDRESS)
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userPublicKey, {
              programId: TOKEN_PROGRAM_ID,
            })

            const mutbAccount = tokenAccounts.value.find(
              (account) => account.account.data.parsed.info.mint === MUTB_MINT_ADDRESS,
            )

            if (mutbAccount) {
              const balance = mutbAccount.account.data.parsed.info.tokenAmount.uiAmount
              setMutbBalance(balance)
              console.log("Updated MUTB balance after swap:", balance)
            }
          } catch (error) {
            console.error("Error refreshing balances after swap:", error)
          }
        }
      } catch (error) {
        console.error("Error executing Jupiter swap:", error)
        setSwapError("Transaction failed. Please try again.")
        setIsSwapping(false)
        return
      }
    } catch (error) {
      console.error("Swap error:", error)
      setSwapError("An unexpected error occurred")
    } finally {
      setIsSwapping(false)
    }
  }

  // Function to create a liquidity pool for MUTB/SOL
  const createLiquidityPool = async () => {
    if (!jupiterClient || !publicKey || !provider) {
      setSwapError("Wallet not connected")
      return
    }

    setIsSwapping(true)
    setSwapError(null)

    try {
      // For demonstration, we'll use 1 SOL and 10,000 MUTB as initial liquidity
      const solAmount = 1
      const mutbAmount = 10000

      // Check balances
      if (balance !== null && solAmount > balance) {
        setSwapError("Insufficient SOL balance for pool creation")
        return
      }

      if (mutbAmount > mutbBalance) {
        setSwapError("Insufficient MUTB balance for pool creation")
        return
      }

      // Create the pool
      const txid = await jupiterClient.createLiquidityPool(
        MUTB_MINT_ADDRESS,
        solAmount,
        mutbAmount,
        new PublicKey(publicKey),
        provider.signTransaction.bind(provider),
      )

      console.log("Liquidity pool created:", txid)

      // Add to transaction history
      setTransactionHistory((prev) => [
        {
          type: "pool",
          timestamp: Date.now(),
          inputAmount: solAmount,
          inputToken: "SOL",
          outputAmount: mutbAmount,
          outputToken: "MUTB",
          txId: txid,
        },
        ...prev.slice(0, 9), // Keep only the 10 most recent transactions
      ])

      // Show success toast
      toast({
        title: "Liquidity Pool Created!",
        description: `Successfully created MUTB/SOL pool with ${solAmount} SOL and ${mutbAmount} MUTB`,
        variant: "default",
        className: "border-2 border-black bg-[#FFD54F] text-black font-mono",
        action: (
          <ToastAction altText="OK" className="border border-black">
            OK
          </ToastAction>
        ),
      })

      // Update balances (in a real implementation, you would refetch)
      if (onBalanceChange && balance !== null) {
        onBalanceChange("sol", balance - solAmount)
      }
      setMutbBalance(mutbBalance - mutbAmount)
    } catch (error) {
      console.error("Error creating liquidity pool:", error)
      setSwapError("Failed to create liquidity pool. Please try again.")
    } finally {
      setIsSwapping(false)
    }
  }

  const toggleSwapDirection = () => {
    setSwapDirection(swapDirection === "sol-to-mutb" ? "mutb-to-sol" : "sol-to-mutb")
    setSwapAmount("1") // Reset amount when toggling
    setJupiterQuote(null) // Reset quote
  }

  const calculateReceiveAmount = () => {
    const amount = Number.parseFloat(swapAmount)
    if (isNaN(amount) || amount <= 0) return "0"

    if (jupiterQuote) {
      // Use Jupiter quote for calculation
      const outputAmount = Number.parseFloat(jupiterQuote.outAmount) / 1e9 // Assuming 9 decimals
      return outputAmount.toFixed(swapDirection === "sol-to-mutb" ? 2 : 4)
    } else {
      // Use our exchange rate as fallback
      if (swapDirection === "sol-to-mutb") {
        return (amount * exchangeRate).toFixed(2)
      } else {
        return (amount / exchangeRate).toFixed(4)
      }
    }
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Format transaction ID to shortened form
  const formatTxId = (txId: string) => {
    if (txId.length <= 12) return txId
    return `${txId.substring(0, 6)}...${txId.substring(txId.length - 6)}`
  }

  return (
    <Card className="bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            <CardTitle className="font-mono">EXCHANGE</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
            >
              <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
              {mutbBalance.toFixed(2)} MUTB
            </Badge>
            <Badge variant="outline" className="bg-white text-black border-2 border-black font-mono">
              {balance !== null ? `${balance.toFixed(2)} SOL` : "..."}
            </Badge>
          </div>
        </div>
        <CardDescription>Swap between SOL and MUTB tokens using Jupiter</CardDescription>
      </CardHeader>
      <CardContent>
        {checkingTradability ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking if MUTB token is tradable on Jupiter...</span>
          </div>
        ) : !isTokenTradable ? (
          <Alert className="mb-4 border-2 border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Token Not Yet Tradable</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p className="mb-2">
                Your MUTB token is not yet indexed by Jupiter. Swaps are disabled until the token is tradable.
              </p>
              <p className="text-sm">
                Jupiter typically takes 24-48 hours to index new liquidity pools. Please check back later.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-4 border-2 border-green-500 bg-green-50">
            <Info className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">MUTB Token is Tradable!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your MUTB token is now tradable on Jupiter. You can perform real swaps on Solana devnet.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="swap" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 border-2 border-black bg-[#FFD54F]">
            <TabsTrigger
              value="swap"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
              onClick={withClickSound()}
            >
              <div className="flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4" />
                <span>SWAP</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="market"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
              onClick={withClickSound()}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>MARKET</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
              onClick={withClickSound()}
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>HISTORY</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="pool"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
              onClick={withClickSound()}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>POOL</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap">
            <div className="space-y-4">
              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium font-mono">FROM</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      Balance:{" "}
                      {swapDirection === "sol-to-mutb"
                        ? balance !== null
                          ? `${balance.toFixed(2)} SOL`
                          : "..."
                        : `${mutbBalance.toFixed(2)} MUTB`}
                    </span>
                    <SoundButton
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs border border-black"
                      onClick={() => {
                        if (swapDirection === "sol-to-mutb" && balance !== null) {
                          setSwapAmount(balance.toString())
                        } else {
                          setSwapAmount(mutbBalance.toString())
                        }
                      }}
                    >
                      MAX
                    </SoundButton>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      className="border-2 border-black font-mono"
                      min="0"
                      step="0.01"
                      disabled={isSwapping || !isTokenTradable}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-md border-2 border-black">
                    <Image
                      src={swapDirection === "sol-to-mutb" ? "/solana-logo.png" : "/images/mutable-token.png"}
                      alt={swapDirection === "sol-to-mutb" ? "SOL" : "MUTB"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium font-mono">{swapDirection === "sol-to-mutb" ? "SOL" : "MUTB"}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <SoundButton
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 border-2 border-black rounded-full bg-white"
                  onClick={toggleSwapDirection}
                  disabled={isSwapping || !isTokenTradable}
                >
                  <ArrowDownUp className="h-4 w-4" />
                </SoundButton>
              </div>

              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium font-mono">TO</span>
                  <span className="text-sm">
                    You receive: {calculateReceiveAmount()} {swapDirection === "sol-to-mutb" ? "MUTB" : "SOL"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={calculateReceiveAmount()}
                      readOnly
                      className="border-2 border-black font-mono bg-gray-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-md border-2 border-black">
                    <Image
                      src={swapDirection === "sol-to-mutb" ? "/images/mutable-token.png" : "/solana-logo.png"}
                      alt={swapDirection === "sol-to-mutb" ? "MUTB" : "SOL"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium font-mono">{swapDirection === "sol-to-mutb" ? "MUTB" : "SOL"}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Slippage Tolerance:</span>
                  <span className="text-sm font-bold">{(slippageBps / 100).toFixed(2)}%</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <SoundButton variant="outline" size="sm" className="h-8 border border-black">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </SoundButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 border-2 border-black">
                    <div className="space-y-4">
                      <h4 className="font-bold">Slippage Tolerance</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{(slippageBps / 100).toFixed(2)}%</span>
                        <div className="flex gap-2">
                          <SoundButton
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs border border-black"
                            onClick={() => setSlippageBps(50)}
                          >
                            0.5%
                          </SoundButton>
                          <SoundButton
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs border border-black"
                            onClick={() => setSlippageBps(100)}
                          >
                            1%
                          </SoundButton>
                          <SoundButton
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs border border-black"
                            onClick={() => setSlippageBps(200)}
                          >
                            2%
                          </SoundButton>
                        </div>
                      </div>
                      <Slider
                        value={[slippageBps]}
                        min={10}
                        max={500}
                        step={10}
                        onValueChange={(value) => setSlippageBps(value[0])}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Your transaction will revert if the price changes unfavorably by more than this percentage.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {swapError && (
                <Alert variant="destructive" className="border-2 border-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{swapError}</AlertDescription>
                </Alert>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                <p className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {isLoadingPrice || isLoadingQuote ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading prices...
                      </span>
                    ) : (
                      <>
                        Live Exchange Rate: 1 SOL = {exchangeRate.toFixed(0)} MUTB. (SOL: $
                        {solPrice?.toFixed(2) || "..."}, MUTB: ${mutbPrice.toFixed(2)})
                        {" Swaps are executed on Solana devnet using Jupiter."}
                      </>
                    )}
                  </span>
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="market">
            <div className="space-y-4">
              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <h3 className="font-bold mb-2 font-mono">MARKET OVERVIEW</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/mutable-token.png"
                        alt="MUTB"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="font-medium">MUTB</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${mutbPrice.toFixed(2)} USD</div>
                      <div className="text-sm text-green-600">Fixed Price</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Image src="/solana-logo.png" alt="SOL" width={24} height={24} className="rounded-full" />
                      <span className="font-medium">SOL</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {isLoadingPrice ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading...
                          </span>
                        ) : (
                          `$${solPrice?.toFixed(2) || "..."} USD`
                        )}
                      </div>
                      <div className="text-sm text-green-600">Live Price</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <h3 className="font-bold mb-2 font-mono">RECENT TRADES</h3>
                <div className="space-y-2">
                  {transactionHistory.length > 0 ? (
                    transactionHistory
                      .filter((tx) => tx.type === "swap")
                      .slice(0, 4)
                      .map((tx, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>
                            {tx.inputAmount.toFixed(tx.inputToken === "SOL" ? 2 : 0)} {tx.inputToken} →{" "}
                            {tx.outputAmount.toFixed(tx.outputToken === "SOL" ? 4 : 0)} {tx.outputToken}
                          </span>
                          <span className="text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span>2.5 SOL → 50 MUTB</span>
                        <span className="text-gray-500">2 min ago</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>100 MUTB → 5 SOL</span>
                        <span className="text-gray-500">5 min ago</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>0.8 SOL → 16 MUTB</span>
                        <span className="text-gray-500">12 min ago</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>30 MUTB → 1.5 SOL</span>
                        <span className="text-gray-500">15 min ago</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <h3 className="font-bold mb-4 font-mono">TRANSACTION HISTORY</h3>
                {transactionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {transactionHistory.map((tx, index) => (
                      <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{tx.type === "swap" ? "Swap" : "Pool Creation"}</span>
                          <span className="text-xs text-gray-500">{formatDate(tx.timestamp)}</span>
                        </div>
                        <div className="text-sm mb-1">
                          {tx.inputAmount.toFixed(tx.inputToken === "SOL" ? 4 : 2)} {tx.inputToken}{" "}
                          {tx.type === "swap" ? "→" : "+"} {tx.outputAmount.toFixed(tx.outputToken === "SOL" ? 4 : 2)}{" "}
                          {tx.outputToken}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>TX: {formatTxId(tx.txId)}</span>
                          <a
                            href={`https://explorer.solana.com/tx/${tx.txId}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-500 hover:underline flex items-center"
                          >
                            View <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No transaction history yet.</p>
                    <p className="text-sm mt-2">
                      Your transactions will appear here after you make a swap or create a pool.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pool">
            <div className="space-y-4">
              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <h3 className="font-bold mb-2 font-mono">LIQUIDITY POOL STATUS</h3>
                <div className="bg-green-100 border border-green-300 p-3 rounded-md text-sm mb-3">
                  <p className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {isTokenTradable
                        ? "Your MUTB token is now tradable on Jupiter! The liquidity pool has been successfully created and indexed."
                        : "Your liquidity pool has been created but may not be indexed by Jupiter yet. This typically takes 24-48 hours."}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Pool Status:</span>
                    <span className="text-sm font-medium">
                      {isTokenTradable ? (
                        <span className="text-green-600">Active & Indexed</span>
                      ) : (
                        <span className="text-yellow-600">Created, Awaiting Indexing</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Jupiter Integration:</span>
                    <span className="text-sm font-medium">
                      {isTokenTradable ? (
                        <span className="text-green-600">Available</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <a
                    href={`https://explorer.solana.com/address/${MUTB_MINT_ADDRESS}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center text-sm"
                  >
                    View MUTB Token on Solana Explorer <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>

              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <h3 className="font-bold mb-2 font-mono">CHECK JUPITER INTEGRATION</h3>
                <p className="text-sm mb-3">
                  You can manually check if your token is tradable on Jupiter using these methods:
                </p>
                <ol className="list-decimal list-inside text-sm space-y-2">
                  <li>
                    <strong>Jupiter Swap UI:</strong> Visit{" "}
                    <a
                      href="https://jup.ag/swap/SOL-5R3KsVN6fucM7Mxyob4oro5Xp3qMxAb7Vi4L4Di57jCY?cluster=devnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Jupiter Swap
                    </a>{" "}
                    and try to swap SOL to MUTB.
                  </li>
                  <li>
                    <strong>API Check:</strong> Use the Jupiter API to check if your token is tradable by making a
                    request to:{" "}
                    <code className="bg-gray-100 p-1 rounded">
                      https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=5R3KsVN6fucM7Mxyob4oro5Xp3qMxAb7Vi4L4Di57jCY&amount=10000000
                    </code>
                  </li>
                  <li>
                    <strong>Refresh Token Status:</strong> Click the button below to check if your token is now tradable
                    on Jupiter.
                  </li>
                </ol>
                <div className="mt-4">
                  <SoundButton
                    className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                    onClick={async () => {
                      setCheckingTradability(true)
                      try {
                        const tradable = await jupiterClient.isTokenTradable(SOL_MINT_ADDRESS, MUTB_MINT_ADDRESS)
                        setIsTokenTradable(tradable)

                        toast({
                          title: tradable ? "Token is Tradable!" : "Token Not Yet Tradable",
                          description: tradable
                            ? "Your MUTB token is now tradable on Jupiter."
                            : "Your token is not yet indexed by Jupiter. Please check back later.",
                          variant: "default",
                          className: tradable
                            ? "border-2 border-green-500 bg-green-50 text-green-800"
                            : "border-2 border-yellow-500 bg-yellow-50 text-yellow-800",
                        })
                      } catch (error) {
                        console.error("Error checking token tradability:", error)
                        toast({
                          title: "Error Checking Token",
                          description: "Failed to check if your token is tradable. Please try again.",
                          variant: "destructive",
                        })
                      } finally {
                        setCheckingTradability(false)
                      }
                    }}
                    disabled={checkingTradability}
                  >
                    {checkingTradability ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        CHECKING...
                      </span>
                    ) : (
                      "CHECK TOKEN STATUS"
                    )}
                  </SoundButton>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {activeTab === "swap" && (
          <SoundButton
            className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            onClick={handleSwap}
            disabled={isSwapping || !publicKey || !isTokenTradable}
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                SWAPPING...
              </span>
            ) : !isTokenTradable ? (
              "TOKEN NOT YET TRADABLE"
            ) : (
              "SWAP TOKENS"
            )}
          </SoundButton>
        )}
      </CardFooter>
    </Card>
  )
}
