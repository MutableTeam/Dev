import { PublicKey } from "@solana/web3.js"
import BN from "bn.js"

// Mock token data
export const MOCK_TOKENS = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    mint: new PublicKey("So11111111111111111111111111111111111111112"),
    decimals: 9,
    logoURI: "/solana-logo.png",
    price: 100, // $100 USD
  },
  MUTB: {
    symbol: "MUTB",
    name: "Mutable Token",
    mint: new PublicKey("5R3KsVN6fucM7Mxyob4oro5Xp3qMxAb7Vi4L4Di57jCY"), // Real MUTB token on devnet
    decimals: 6,
    logoURI: "/images/mutable-token.png",
    price: 0.01, // $0.01 USD fixed price
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    price: 1, // $1 USD
  },
}

// Mock token pair data
export const MOCK_TOKEN_PAIRS = {
  "SOL-USDC": {
    tokenA: MOCK_TOKENS.SOL,
    tokenB: MOCK_TOKENS.USDC,
    reserveA: new BN(1000000000), // 1 SOL (in lamports)
    reserveB: new BN(100000000), // 100 USDC (in micro-units)
    lpTokenMint: new PublicKey("LP11111111111111111111111111111111111111111"),
    feePercentage: 30, // 0.3%
  },
  "MUTB-USDC": {
    tokenA: MOCK_TOKENS.MUTB,
    tokenB: MOCK_TOKENS.USDC,
    reserveA: new BN(10000000000), // 10,000 MUTB (in micro-units)
    reserveB: new BN(100000000), // 100 USDC (in micro-units)
    lpTokenMint: new PublicKey("LP22222222222222222222222222222222222222222"),
    feePercentage: 30, // 0.3%
  },
  "SOL-MUTB": {
    tokenA: MOCK_TOKENS.SOL,
    tokenB: MOCK_TOKENS.MUTB,
    reserveA: new BN(1000000000), // 1 SOL (in lamports)
    reserveB: new BN(10000000000), // 10,000 MUTB (in micro-units)
    lpTokenMint: new PublicKey("LP33333333333333333333333333333333333333333"),
    feePercentage: 30, // 0.3%
  },
}

// Mock user balances
export const MOCK_USER_BALANCES = {
  SOL: new BN(10000000000), // 10 SOL
  MUTB: new BN(100000000000), // 100,000 MUTB
  USDC: new BN(1000000000), // 1,000 USDC
}

// Mock function to simulate a swap
export async function mockSwap(
  tokenPair: string,
  inputToken: string,
  outputToken: string,
  amount: BN,
): Promise<{
  success: boolean
  txId?: string
  inputAmount?: BN
  outputAmount?: BN
  error?: string
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Randomly fail 5% of the time to simulate network issues
  if (Math.random() < 0.05) {
    return {
      success: false,
      error: "Transaction failed: Network error",
    }
  }

  try {
    const pair = MOCK_TOKEN_PAIRS[tokenPair]
    if (!pair) {
      throw new Error(`Token pair ${tokenPair} not found`)
    }

    let inputReserve: BN
    let outputReserve: BN

    if (inputToken === pair.tokenA.symbol) {
      inputReserve = pair.reserveA
      outputReserve = pair.reserveB
    } else {
      inputReserve = pair.reserveB
      outputReserve = pair.reserveA
    }

    // Calculate output amount using constant product formula
    const feeMultiplier = 10000 - pair.feePercentage
    const inputAmountWithFee = amount.mul(new BN(feeMultiplier)).div(new BN(10000))
    const numerator = inputAmountWithFee.mul(outputReserve)
    const denominator = inputReserve.add(inputAmountWithFee)
    const outputAmount = numerator.div(denominator)

    // Generate a mock transaction ID
    const txId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

    return {
      success: true,
      txId,
      inputAmount: amount,
      outputAmount,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// Mock function to get token balances
export async function mockGetTokenBalances(wallet: PublicKey): Promise<{ [key: string]: BN }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock balances
  return { ...MOCK_USER_BALANCES }
}

// Mock function to get token pair data
export async function mockGetTokenPairData(
  tokenPair: string,
): Promise<(typeof MOCK_TOKEN_PAIRS)[keyof typeof MOCK_TOKEN_PAIRS]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const pair = MOCK_TOKEN_PAIRS[tokenPair]
  if (!pair) {
    throw new Error(`Token pair ${tokenPair} not found`)
  }

  return { ...pair }
}

// Mock function to get all supported tokens
export async function mockGetSupportedTokens(): Promise<typeof MOCK_TOKENS> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  return { ...MOCK_TOKENS }
}
