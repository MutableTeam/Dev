import { type Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint,
} from "@solana/spl-token"
import BN from "bn.js"

// Token registry for the exchange
export interface TokenInfo {
  mint: string // Public key of the token mint
  symbol: string // Token symbol (e.g., "SOL", "MUTB")
  name: string // Token name (e.g., "Solana", "Mutable Token")
  decimals: number // Number of decimals for the token
  logoURI: string // URL to the token logo
  usdPrice?: number // Current USD price (optional)
}

// Registry of supported tokens
export const TOKEN_REGISTRY: { [symbol: string]: TokenInfo } = {
  SOL: {
    mint: "So11111111111111111111111111111111111111112", // Native SOL wrapped mint
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoURI: "/solana-logo.png",
  },
  MUTB: {
    // Real MUTB token mint on devnet
    mint: "5R3KsVN6fucM7Mxyob4oro5Xp3qMxAb7Vi4L4Di57jCY",
    symbol: "MUTB",
    name: "Mutable Token",
    decimals: 6,
    logoURI: "/images/mutable-token.png",
    usdPrice: 0.01, // Fixed at $0.01 as requested
  },
  // Add more tokens as needed
}

// Get token info by symbol
export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return TOKEN_REGISTRY[symbol]
}

// Get token info by mint address
export function getTokenByMint(mintAddress: string): TokenInfo | undefined {
  return Object.values(TOKEN_REGISTRY).find((token) => token.mint === mintAddress)
}

// Convert amount from human-readable to raw (accounting for decimals)
export function toRawAmount(amount: number, decimals: number): BN {
  return new BN(Math.floor(amount * 10 ** decimals))
}

// Convert amount from raw to human-readable
export function toDisplayAmount(rawAmount: BN, decimals: number): number {
  return rawAmount.toNumber() / 10 ** decimals
}

// Get the associated token account for a wallet and token
export async function getTokenAccount(
  connection: Connection,
  wallet: PublicKey,
  tokenMint: PublicKey,
): Promise<PublicKey> {
  return await getAssociatedTokenAddress(tokenMint, wallet, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
}

// Check if a token account exists
export async function tokenAccountExists(connection: Connection, tokenAccount: PublicKey): Promise<boolean> {
  try {
    const account = await connection.getAccountInfo(tokenAccount)
    return account !== null
  } catch (error) {
    return false
  }
}

// Create a token account if it doesn't exist
export async function createTokenAccountIfNeeded(
  connection: Connection,
  payer: PublicKey,
  tokenAccount: PublicKey,
  tokenMint: PublicKey,
  owner: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
): Promise<boolean> {
  try {
    // Check if the token account already exists
    if (await tokenAccountExists(connection, tokenAccount)) {
      return true
    }

    // Create the token account
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer,
        tokenAccount,
        owner,
        tokenMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    )

    // Sign and send the transaction
    const signedTx = await signTransaction(transaction)
    const txid = await connection.sendRawTransaction(signedTx.serialize())
    await connection.confirmTransaction(txid)

    return true
  } catch (error) {
    console.error("Error creating token account:", error)
    return false
  }
}

// Get token balance for a wallet
export async function getTokenBalance(
  connection: Connection,
  wallet: PublicKey,
  tokenMint: PublicKey,
): Promise<number> {
  try {
    // Handle SOL separately
    if (tokenMint.toString() === TOKEN_REGISTRY.SOL.mint) {
      const balance = await connection.getBalance(wallet)
      return balance / LAMPORTS_PER_SOL
    }

    // For other tokens, get the associated token account
    const tokenAccount = await getTokenAccount(connection, wallet, tokenMint)

    // Check if the token account exists
    if (!(await tokenAccountExists(connection, tokenAccount))) {
      return 0
    }

    // Get the token account info
    const accountInfo = await getAccount(connection, tokenAccount)

    // Get the token mint info to get decimals
    const mintInfo = await getMint(connection, tokenMint)

    // Calculate the balance
    return Number(accountInfo.amount) / 10 ** mintInfo.decimals
  } catch (error) {
    console.error("Error getting token balance:", error)
    return 0
  }
}

// Get all token balances for a wallet
export async function getAllTokenBalances(
  connection: Connection,
  wallet: PublicKey,
): Promise<{ [symbol: string]: number }> {
  const balances: { [symbol: string]: number } = {}

  // Get SOL balance
  balances.SOL = (await connection.getBalance(wallet)) / LAMPORTS_PER_SOL

  // Get other token balances
  for (const [symbol, tokenInfo] of Object.entries(TOKEN_REGISTRY)) {
    if (symbol === "SOL") continue // Already handled

    const tokenMint = new PublicKey(tokenInfo.mint)
    balances[symbol] = await getTokenBalance(connection, wallet, tokenMint)
  }

  return balances
}

// Calculate USD value of tokens
export function calculateUsdValue(amount: number, symbol: string): number {
  const tokenInfo = TOKEN_REGISTRY[symbol]
  if (!tokenInfo || !tokenInfo.usdPrice) return 0

  return amount * tokenInfo.usdPrice
}

// Update token prices
export function updateTokenPrice(symbol: string, price: number): void {
  if (TOKEN_REGISTRY[symbol]) {
    TOKEN_REGISTRY[symbol].usdPrice = price
  }
}
