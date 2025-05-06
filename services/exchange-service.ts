import type { Connection, PublicKey, Transaction } from "@solana/web3.js"
import BN from "bn.js"
import { getTokenBySymbol, toRawAmount } from "../utils/token-utils"
import { mockSwap, mockGetTokenPairData } from "../utils/exchange-mock"
import { calculateSwapOutput, calculatePriceImpact } from "../solana/programs/token-exchange-program"

// Interface for swap parameters
export interface SwapParams {
  fromToken: string
  toToken: string
  amount: number
  slippageTolerance: number
}

// Interface for swap quote
export interface SwapQuote {
  inputAmount: number
  outputAmount: number
  exchangeRate: number
  priceImpact: number
  fee: number
  minOutputAmount: number
}

// Exchange service class
export class ExchangeService {
  private connection: Connection
  private useMock = true // Set to false when using a real deployed program

  constructor(connection: Connection) {
    this.connection = connection
  }

  // Get a quote for a swap
  async getSwapQuote(params: SwapParams): Promise<SwapQuote> {
    const { fromToken, toToken, amount, slippageTolerance } = params

    // Get token info
    const fromTokenInfo = getTokenBySymbol(fromToken)
    const toTokenInfo = getTokenBySymbol(toToken)

    if (!fromTokenInfo || !toTokenInfo) {
      throw new Error("Invalid token symbols")
    }

    // Convert amount to raw amount
    const rawAmount = toRawAmount(amount, fromTokenInfo.decimals)

    if (this.useMock) {
      // Use mock implementation
      const tokenPair = `${fromToken}-${toToken}`
      const pairData = await mockGetTokenPairData(tokenPair).catch(() => {
        // If pair not found, try reverse order
        return mockGetTokenPairData(`${toToken}-${fromToken}`)
      })

      let inputReserve: BN
      let outputReserve: BN
      let feePercentage: number

      if (fromToken === pairData.tokenA.symbol) {
        inputReserve = pairData.reserveA
        outputReserve = pairData.reserveB
      } else {
        inputReserve = pairData.reserveB
        outputReserve = pairData.reserveA
      }

      feePercentage = pairData.feePercentage

      // Calculate output amount
      const outputAmount = calculateSwapOutput(rawAmount, inputReserve, outputReserve, feePercentage)

      // Calculate price impact
      const priceImpact = calculatePriceImpact(rawAmount, inputReserve, outputAmount, outputReserve)

      // Calculate exchange rate
      const exchangeRate = outputAmount.toNumber() / 10 ** toTokenInfo.decimals / amount

      // Calculate fee
      const fee = (amount * feePercentage) / 10000

      // Calculate minimum output amount with slippage
      const minOutputAmount = outputAmount.mul(new BN(10000 - Math.floor(slippageTolerance * 100))).div(new BN(10000))

      return {
        inputAmount: amount,
        outputAmount: outputAmount.toNumber() / 10 ** toTokenInfo.decimals,
        exchangeRate,
        priceImpact,
        fee,
        minOutputAmount: minOutputAmount.toNumber() / 10 ** toTokenInfo.decimals,
      }
    } else {
      // TODO: Implement real program interaction
      throw new Error("Real program interaction not implemented yet")
    }
  }

  // Execute a swap
  async executeSwap(
    params: SwapParams,
    wallet: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
  ): Promise<string> {
    const { fromToken, toToken, amount } = params

    // Get token info
    const fromTokenInfo = getTokenBySymbol(fromToken)
    const toTokenInfo = getTokenBySymbol(toToken)

    if (!fromTokenInfo || !toTokenInfo) {
      throw new Error("Invalid token symbols")
    }

    // Convert amount to raw amount
    const rawAmount = toRawAmount(amount, fromTokenInfo.decimals)

    if (this.useMock) {
      // Use mock implementation
      const tokenPair = `${fromToken}-${toToken}`
      const result = await mockSwap(tokenPair, fromToken, toToken, rawAmount)

      if (!result.success) {
        throw new Error(result.error || "Swap failed")
      }

      return result.txId || ""
    } else {
      // TODO: Implement real program interaction
      throw new Error("Real program interaction not implemented yet")
    }
  }
}

// Singleton instance
let exchangeService: ExchangeService | null = null

// Get the exchange service
export function getExchangeService(connection: Connection): ExchangeService {
  if (!exchangeService) {
    exchangeService = new ExchangeService(connection)
  }
  return exchangeService
}
