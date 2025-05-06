"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type { Connection } from "@solana/web3.js"
import { getCryptoPrice, calculateExchangeRate, getMUTBPrice } from "@/utils/crypto-price"
import ExchangeContainer from "./token-exchange/exchange-container"

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
  const [mutbPrice, setMutbPrice] = useState<number>(1.0) // Fixed at $1.00
  const [exchangeRate, setExchangeRate] = useState<number>(20)
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false)

  useEffect(() => {
    const fetchSolPrice = async () => {
      setIsLoadingPrice(true)
      try {
        const price = await getCryptoPrice("solana")
        setSolPrice(price)

        // MUTB is fixed at $1.00
        const mutbPriceValue = getMUTBPrice()
        setMutbPrice(mutbPriceValue)

        // Calculate how many MUTB you get per SOL
        const rate = calculateExchangeRate(price, mutbPriceValue)
        setExchangeRate(rate)
      } catch (error) {
        console.error("Failed to fetch SOL price:", error)
        // Fallback to default values
        setSolPrice(20.5)
        setExchangeRate(20.5) // 20.50 / 1.00 = 20.5 MUTB per SOL
      } finally {
        setIsLoadingPrice(false)
      }
    }

    fetchSolPrice()

    // Refresh price every 60 seconds
    const intervalId = setInterval(fetchSolPrice, 60000)

    return () => clearInterval(intervalId)
  }, [])

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
    <div className="container mx-auto p-4">
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          <Image src="/images/mutable-logo.png" alt="Mutable Logo" width={40} height={40} />
          <h1 className="text-3xl font-bold">Mutable Marketplace</h1>
        </div>
      </div>

      <Tabs defaultValue="exchange" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exchange">Token Exchange</TabsTrigger>
          <TabsTrigger value="nft">NFT Marketplace</TabsTrigger>
          <TabsTrigger value="staking">Token Staking</TabsTrigger>
        </TabsList>

        <TabsContent value="exchange" className="mt-6">
          <ExchangeContainer />
        </TabsContent>

        <TabsContent value="nft" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>NFT Marketplace</CardTitle>
              <CardDescription>Buy, sell, and trade unique digital collectibles.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staking" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Staking</CardTitle>
              <CardDescription>Stake your tokens to earn rewards.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
