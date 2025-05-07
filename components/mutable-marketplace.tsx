"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeftRight, TrendingUp, ArrowDownUp, Info, Loader2, AlertCircle } from "lucide-react"
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
import { mockSwapSolForMutb, mockSwapMutbForSol, mockGetExchangeRate } from "@/utils/token-swap-mock"

// Flag to use mock implementation for testing
const USE_MOCK = true

// MUTB token mint address on devnet - using a valid base58 string
const MUTB_MINT_ADDRESS = "5R3KsVN6fucM7Mxyob4oro5Xp3qMxAb7Vi4L4Di57jCY"

interface MutableMarketplaceProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
}

export default function MutableMarketplace({ publicKey, balance, provider, connection }: MutableMarketplaceProps) {
  const [activeTab, setActiveTab] = useState("swap")
  const [mutbBalance, setMutbBalance] = useState<number>(100) // Mock MUTB balance
  const [swapAmount, setSwapAmount] = useState<string>("1")
  const [swapDirection, setSwapDirection] = useState<"sol-to-mutb" | "mutb-to-sol">("sol-to-mutb")

  // Replace the static exchange rate with state variables
  const [solPrice, setSolPrice] = useState<number | null>(null)
  const [mutbPrice, setMutbPrice] = useState<number>(0.01) // Fixed at $0.01
  const [exchangeRate, setExchangeRate] = useState<number>(10000)
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false)
  const [isSwapping, setIsSwapping] = useState<boolean>(false)
  const [swapError, setSwapError] = useState<string | null>(null)
  const [mutbTokenAccount, setMutbTokenAccount] = useState<string | null>(null)

  // Fetch MUTB token account and balance
  useEffect(() => {
    const fetchTokenAccount = async () => {
      if (!publicKey) return

      try {
        // Create PublicKey instance safely
        let userPublicKey: PublicKey
        try {
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

        // In test mode, just use mock data
        if (USE_MOCK) {
          setMutbTokenAccount("mock-token-account")
          setMutbBalance(100) // Mock balance
          return
        }

        // Only fetch real token accounts if not in mock mode
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
          } else {
            // No existing token account found
            setMutbTokenAccount(null)
            setMutbBalance(0)
          }
        } catch (error) {
          console.error("Error fetching token accounts:", error)
          // Use mock data as fallback
          setMutbTokenAccount("mock-token-account")
          setMutbBalance(100) // Mock balance
        }
      } catch (error) {
        console.error("Error in fetchTokenAccount:", error)
      }
    }

    const fetchExchangeRate = async () => {
      setIsLoadingPrice(true)
      try {
        // Get the exchange rate
        const rate = mockGetExchangeRate()
        setExchangeRate(rate)

        // Calculate SOL price based on MUTB price and exchange rate
        // MUTB is fixed at $0.01
        const mutbPriceValue = 0.01
        setMutbPrice(mutbPriceValue)

        // SOL price = MUTB price * MUTB per SOL
        const solPriceValue = mutbPriceValue * rate
        setSolPrice(solPriceValue)
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error)
        // Fallback to default values
        setExchangeRate(10000) // 10,000 MUTB per SOL
        setSolPrice(100) // $100 per SOL
        setMutbPrice(0.01) // $0.01 per MUTB
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

  const handleSwap = async () => {
    setSwapError(null)
    setIsSwapping(true)

    try {
      const amount = Number.parseFloat(swapAmount)
      if (isNaN(amount) || amount <= 0) {
        setSwapError("Please enter a valid amount")
        setIsSwapping(false)
        return
      }

      if (!provider && !USE_MOCK) {
        setSwapError("Wallet not connected")
        setIsSwapping(false)
        return
      }

      if (swapDirection === "sol-to-mutb") {
        // Check if user has enough SOL
        if (balance !== null && amount > balance) {
          setSwapError("Insufficient SOL balance")
          setIsSwapping(false)
          return
        }

        // Calculate minimum amount out with 1% slippage
        const minimumAmountOut = amount * exchangeRate * 0.99

        try {
          // Use mock implementation
          const result = await mockSwapSolForMutb(amount)
          console.log("Mock swap completed:", result)
          setMutbBalance(mutbBalance + result.amount)
        } catch (error) {
          console.error("Error executing swap:", error)
          setSwapError("Transaction failed. Please try again.")
          setIsSwapping(false)
          return
        }
      } else {
        // MUTB to SOL swap
        // Check if user has enough MUTB
        if (amount > mutbBalance) {
          setSwapError("Insufficient MUTB balance")
          setIsSwapping(false)
          return
        }

        // Calculate minimum amount out with 1% slippage
        const minimumAmountOut = (amount / exchangeRate) * 0.99

        try {
          // Use mock implementation
          const result = await mockSwapMutbForSol(amount)
          console.log("Mock swap completed:", result)
          setMutbBalance(mutbBalance - amount)
        } catch (error) {
          console.error("Error executing swap:", error)
          setSwapError("Transaction failed. Please try again.")
          setIsSwapping(false)
          return
        }
      }
    } catch (error) {
      console.error("Swap error:", error)
      setSwapError("An unexpected error occurred")
    } finally {
      setIsSwapping(false)
    }
  }

  const toggleSwapDirection = () => {
    setSwapDirection(swapDirection === "sol-to-mutb" ? "mutb-to-sol" : "sol-to-mutb")
    setSwapAmount("1") // Reset amount when toggling
  }

  const calculateReceiveAmount = () => {
    const amount = Number.parseFloat(swapAmount)
    if (isNaN(amount) || amount <= 0) return "0"

    if (swapDirection === "sol-to-mutb") {
      return (amount * exchangeRate).toFixed(2)
    } else {
      return (amount / exchangeRate).toFixed(4)
    }
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
        <CardDescription>Swap between SOL and MUTB tokens</CardDescription>
      </CardHeader>
      <CardContent>
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
              value="info"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
              onClick={withClickSound()}
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>INFO</span>
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
                      disabled={isSwapping}
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
                  disabled={isSwapping}
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
                    {isLoadingPrice ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading prices...
                      </span>
                    ) : (
                      <>
                        Live Exchange Rate: 1 SOL = {exchangeRate.toFixed(0)} MUTB. (SOL: $
                        {solPrice?.toFixed(2) || "..."}, MUTB: ${mutbPrice.toFixed(2)}) Swaps are executed on Solana
                        devnet.
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
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="space-y-4">
              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <h3 className="font-bold mb-2 font-mono">ABOUT MUTB TOKEN</h3>
                <p className="text-sm mb-3">
                  MUTB is the native utility token of the Mutable gaming platform. It can be used for:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Entering tournaments and competitions</li>
                  <li>Purchasing in-game items and power-ups</li>
                  <li>Staking to earn rewards and exclusive benefits</li>
                  <li>Governance voting on platform decisions</li>
                </ul>
              </div>

              <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
                <h3 className="font-bold mb-2 font-mono">TOKEN METRICS</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Supply:</span>
                    <span className="text-sm font-medium">100,000,000 MUTB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Circulating Supply:</span>
                    <span className="text-sm font-medium">25,000,000 MUTB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Price:</span>
                    <span className="text-sm font-medium">${mutbPrice.toFixed(2)} USD (Fixed)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Market Cap:</span>
                    <span className="text-sm font-medium">${(25000000 * mutbPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Token Type:</span>
                    <span className="text-sm font-medium">SPL (Solana)</span>
                  </div>
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
            disabled={isSwapping || (!publicKey && !USE_MOCK)}
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                SWAPPING...
              </span>
            ) : (
              "SWAP TOKENS"
            )}
          </SoundButton>
        )}
      </CardFooter>
    </Card>
  )
}
