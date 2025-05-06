import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import BN from "bn.js"

// Program ID for the token exchange program
// Using a valid base58 encoded public key format
export const TOKEN_EXCHANGE_PROGRAM_ID = new PublicKey("11111111111111111111111111111111")

// Account layout for the exchange state account
export interface ExchangeStateAccount {
  isInitialized: boolean
  owner: PublicKey
  feeAccount: PublicKey
  feePercentage: number // Represented as basis points (1/100 of a percent)
  supportedTokens: PublicKey[]
}

// Account layout for a token pair
export interface TokenPairAccount {
  isInitialized: boolean
  tokenA: PublicKey
  tokenB: PublicKey
  reserveA: BN
  reserveB: BN
  lpTokenMint: PublicKey
  lastPrice: number
}

// Instruction types
export enum ExchangeInstructionType {
  Initialize = 0,
  AddTokenPair = 1,
  Swap = 2,
  AddLiquidity = 3,
  RemoveLiquidity = 4,
  UpdateFees = 5,
}

// Function to create an instruction to initialize the exchange
export function createInitializeExchangeInstruction(
  payer: PublicKey,
  exchangeStateAccount: PublicKey,
  feeAccount: PublicKey,
  feePercentage: number,
): TransactionInstruction {
  const data = Buffer.alloc(9)
  data.writeUInt8(ExchangeInstructionType.Initialize, 0)
  data.writeUInt32LE(feePercentage, 1)

  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: exchangeStateAccount, isSigner: false, isWritable: true },
      { pubkey: feeAccount, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: TOKEN_EXCHANGE_PROGRAM_ID,
    data,
  })
}

// Function to create an instruction to add a token pair
export function createAddTokenPairInstruction(
  payer: PublicKey,
  exchangeStateAccount: PublicKey,
  tokenPairAccount: PublicKey,
  tokenA: PublicKey,
  tokenB: PublicKey,
  lpTokenMint: PublicKey,
): TransactionInstruction {
  const data = Buffer.alloc(1)
  data.writeUInt8(ExchangeInstructionType.AddTokenPair, 0)

  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: exchangeStateAccount, isSigner: false, isWritable: true },
      { pubkey: tokenPairAccount, isSigner: false, isWritable: true },
      { pubkey: tokenA, isSigner: false, isWritable: false },
      { pubkey: tokenB, isSigner: false, isWritable: false },
      { pubkey: lpTokenMint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: TOKEN_EXCHANGE_PROGRAM_ID,
    data,
  })
}

// Function to create an instruction to swap tokens
export function createSwapInstruction(
  payer: PublicKey,
  exchangeStateAccount: PublicKey,
  tokenPairAccount: PublicKey,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  feeAccount: PublicKey,
  amount: BN,
  minAmountOut: BN,
): TransactionInstruction {
  const data = Buffer.alloc(17)
  data.writeUInt8(ExchangeInstructionType.Swap, 0)

  // Write amount as a 64-bit number (8 bytes)
  const amountBuffer = Buffer.alloc(8)
  amount.toArrayLike(Buffer, "le", 8).copy(amountBuffer)
  amountBuffer.copy(data, 1)

  // Write minAmountOut as a 64-bit number (8 bytes)
  const minAmountOutBuffer = Buffer.alloc(8)
  minAmountOut.toArrayLike(Buffer, "le", 8).copy(minAmountOutBuffer)
  minAmountOutBuffer.copy(data, 9)

  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: exchangeStateAccount, isSigner: false, isWritable: false },
      { pubkey: tokenPairAccount, isSigner: false, isWritable: true },
      { pubkey: sourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: destinationTokenAccount, isSigner: false, isWritable: true },
      { pubkey: feeAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: TOKEN_EXCHANGE_PROGRAM_ID,
    data,
  })
}

// Function to create an instruction to add liquidity
export function createAddLiquidityInstruction(
  payer: PublicKey,
  exchangeStateAccount: PublicKey,
  tokenPairAccount: PublicKey,
  tokenAAccount: PublicKey,
  tokenBAccount: PublicKey,
  lpTokenAccount: PublicKey,
  amountA: BN,
  amountB: BN,
  minLpTokens: BN,
): TransactionInstruction {
  const data = Buffer.alloc(25)
  data.writeUInt8(ExchangeInstructionType.AddLiquidity, 0)

  // Write amountA as a 64-bit number (8 bytes)
  const amountABuffer = Buffer.alloc(8)
  amountA.toArrayLike(Buffer, "le", 8).copy(amountABuffer)
  amountABuffer.copy(data, 1)

  // Write amountB as a 64-bit number (8 bytes)
  const amountBBuffer = Buffer.alloc(8)
  amountB.toArrayLike(Buffer, "le", 8).copy(amountBBuffer)
  amountBBuffer.copy(data, 9)

  // Write minLpTokens as a 64-bit number (8 bytes)
  const minLpTokensBuffer = Buffer.alloc(8)
  minLpTokens.toArrayLike(Buffer, "le", 8).copy(minLpTokensBuffer)
  minLpTokensBuffer.copy(data, 17)

  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: exchangeStateAccount, isSigner: false, isWritable: false },
      { pubkey: tokenPairAccount, isSigner: false, isWritable: true },
      { pubkey: tokenAAccount, isSigner: false, isWritable: true },
      { pubkey: tokenBAccount, isSigner: false, isWritable: true },
      { pubkey: lpTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: TOKEN_EXCHANGE_PROGRAM_ID,
    data,
  })
}

// Function to create an instruction to remove liquidity
export function createRemoveLiquidityInstruction(
  payer: PublicKey,
  exchangeStateAccount: PublicKey,
  tokenPairAccount: PublicKey,
  tokenAAccount: PublicKey,
  tokenBAccount: PublicKey,
  lpTokenAccount: PublicKey,
  lpTokenAmount: BN,
  minAmountA: BN,
  minAmountB: BN,
): TransactionInstruction {
  const data = Buffer.alloc(25)
  data.writeUInt8(ExchangeInstructionType.RemoveLiquidity, 0)

  // Write lpTokenAmount as a 64-bit number (8 bytes)
  const lpTokenAmountBuffer = Buffer.alloc(8)
  lpTokenAmount.toArrayLike(Buffer, "le", 8).copy(lpTokenAmountBuffer)
  lpTokenAmountBuffer.copy(data, 1)

  // Write minAmountA as a 64-bit number (8 bytes)
  const minAmountABuffer = Buffer.alloc(8)
  minAmountA.toArrayLike(Buffer, "le", 8).copy(minAmountABuffer)
  minAmountABuffer.copy(data, 9)

  // Write minAmountB as a 64-bit number (8 bytes)
  const minAmountBBuffer = Buffer.alloc(8)
  minAmountB.toArrayLike(Buffer, "le", 8).copy(minAmountBBuffer)
  minAmountBBuffer.copy(data, 17)

  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: exchangeStateAccount, isSigner: false, isWritable: false },
      { pubkey: tokenPairAccount, isSigner: false, isWritable: true },
      { pubkey: tokenAAccount, isSigner: false, isWritable: true },
      { pubkey: tokenBAccount, isSigner: false, isWritable: true },
      { pubkey: lpTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: TOKEN_EXCHANGE_PROGRAM_ID,
    data,
  })
}

// Function to create an instruction to update fees
export function createUpdateFeesInstruction(
  payer: PublicKey,
  exchangeStateAccount: PublicKey,
  newFeeAccount: PublicKey,
  newFeePercentage: number,
): TransactionInstruction {
  const data = Buffer.alloc(5)
  data.writeUInt8(ExchangeInstructionType.UpdateFees, 0)
  data.writeUInt32LE(newFeePercentage, 1)

  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: exchangeStateAccount, isSigner: false, isWritable: true },
      { pubkey: newFeeAccount, isSigner: false, isWritable: false },
    ],
    programId: TOKEN_EXCHANGE_PROGRAM_ID,
    data,
  })
}

// Helper function to find a PDA for the exchange state account
export async function findExchangeStateAccount(
  programId: PublicKey = TOKEN_EXCHANGE_PROGRAM_ID,
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress([Buffer.from("exchange_state")], programId)
}

// Helper function to find a PDA for a token pair account
export async function findTokenPairAccount(
  tokenA: PublicKey,
  tokenB: PublicKey,
  programId: PublicKey = TOKEN_EXCHANGE_PROGRAM_ID,
): Promise<[PublicKey, number]> {
  // Sort token addresses to ensure consistent PDAs
  const [token1, token2] = tokenA.toBuffer().compare(tokenB.toBuffer()) < 0 ? [tokenA, tokenB] : [tokenB, tokenA]

  return PublicKey.findProgramAddress([Buffer.from("token_pair"), token1.toBuffer(), token2.toBuffer()], programId)
}

// Helper function to calculate the output amount for a swap
export function calculateSwapOutput(inputAmount: BN, inputReserve: BN, outputReserve: BN, feePercentage: number): BN {
  // Apply fee
  const feeMultiplier = 10000 - feePercentage
  const inputAmountWithFee = inputAmount.mul(new BN(feeMultiplier)).div(new BN(10000))

  // Calculate output using constant product formula: x * y = k
  const numerator = inputAmountWithFee.mul(outputReserve)
  const denominator = inputReserve.add(inputAmountWithFee)

  return numerator.div(denominator)
}

// Helper function to calculate the price impact of a swap
export function calculatePriceImpact(inputAmount: BN, inputReserve: BN, outputAmount: BN, outputReserve: BN): number {
  // Calculate the spot price before the swap
  const spotPrice = outputReserve.toNumber() / inputReserve.toNumber()

  // Calculate the execution price
  const executionPrice = outputAmount.toNumber() / inputAmount.toNumber()

  // Calculate the price impact
  return Math.abs((executionPrice - spotPrice) / spotPrice) * 100
}
