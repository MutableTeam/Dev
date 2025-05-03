"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeftRight, TrendingUp, ArrowDownUp, Info } from "lucide-react"
import Image from "next/image"
import type { Connection } from "@solana/web3.js"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"

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

  // Mock exchange rate: 1 SOL = 20 MUTB
  const exchangeRate = 20

  const handleSwap = () => {
    const amount = Number.parseFloat(swapAmount)
    if (isNaN(amount) || amount <= 0) return

    if (swapDirection === "sol-to-mutb") {
      // Check if user has enough SOL
      if (balance !== null && amount > balance) {
        alert("Insufficient SOL balance")
        return
      }
      // Perform swap: SOL to MUTB
      setMutbBalance(mutbBalance + amount * exchangeRate)
    } else {
      // Check if user has enough MUTB
      if (amount > mutbBalance) {
        alert("Insufficient MUTB balance")
        return
      }
      // Perform swap: MUTB to SOL
      setMutbBalance(mutbBalance - amount)
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
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-md border-2 border-black">
                    <Image
                      src={
                        swapDirection === "sol-to-mutb"
                          ? "/placeholder.svg?height=24&width=24&query=solana logo"
                          : "/images/mutable-token.png"
                      }
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
                      src={
                        swapDirection === "sol-to-mutb"
                          ? "/images/mutable-token.png"
                          : "/placeholder.svg?height=24&width=24&query=solana logo"
                      }
                      alt={swapDirection === "sol-to-mutb" ? "MUTB" : "SOL"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium font-mono">{swapDirection === "sol-to-mutb" ? "MUTB" : "SOL"}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                <p className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Exchange Rate: 1 SOL = {exchangeRate} MUTB. Swaps are instant with no fees during this beta period.
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
                      <div className="font-medium">${(0.25).toFixed(2)} USD</div>
                      <div className="text-sm text-green-600">+5.2%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/solana-logo.png"
                        alt="SOL"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="font-medium">SOL</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${(5.0).toFixed(2)} USD</div>
                      <div className="text-sm text-red-600">-2.1%</div>
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
                    <span className="text-sm">Market Cap:</span>
                    <span className="text-sm font-medium">$6,250,000</span>
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
          >
            SWAP TOKENS
          </SoundButton>
        )}
      </CardFooter>
    </Card>
  )
}
