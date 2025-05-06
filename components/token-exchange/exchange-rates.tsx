"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TOKEN_REGISTRY } from "../../utils/token-utils"
import { useExchange } from "../../contexts/exchange-context"

export default function ExchangeRates() {
  const { supportedTokens } = useExchange()
  const [activeTab, setActiveTab] = useState("rates")

  // Generate all possible token pairs
  const tokenPairs = React.useMemo(() => {
    const pairs: [string, string][] = []
    for (let i = 0; i < supportedTokens.length; i++) {
      for (let j = i + 1; j < supportedTokens.length; j++) {
        pairs.push([supportedTokens[i], supportedTokens[j]])
      }
    }
    return pairs
  }, [supportedTokens])

  // Mock exchange rates
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})

  // Mock exchange stats
  const [stats, setStats] = useState({
    totalLiquidity: 1000000,
    volume24h: 250000,
    fees24h: 750,
    trades24h: 1250,
  })

  // Generate mock exchange rates
  useEffect(() => {
    const rates: Record<string, number> = {}

    // SOL to MUTB rate (based on their USD prices)
    const solPrice = TOKEN_REGISTRY.SOL.usdPrice || 20.5
    const mutbPrice = TOKEN_REGISTRY.MUTB.usdPrice || 1.0

    rates["SOL-MUTB"] = solPrice / mutbPrice

    // Add more rates as needed

    setExchangeRates(rates)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exchange Info</CardTitle>
        <CardDescription>Market rates and statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="rates">
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-sm font-medium p-2 border-b">
                <div>Pair</div>
                <div className="text-right">Rate</div>
                <div className="text-right">Inverse Rate</div>
              </div>

              {tokenPairs.map(([tokenA, tokenB]) => {
                const pairKey = `${tokenA}-${tokenB}`
                const rate = exchangeRates[pairKey] || 0
                const inverseRate = rate ? 1 / rate : 0

                return (
                  <div key={pairKey} className="grid grid-cols-3 text-sm p-2 border-b">
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-2">
                        <img
                          src={TOKEN_REGISTRY[tokenA].logoURI || "/placeholder.svg"}
                          alt={tokenA}
                          className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                        />
                        <img
                          src={TOKEN_REGISTRY[tokenB].logoURI || "/placeholder.svg"}
                          alt={tokenB}
                          className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                        />
                      </div>
                      <span>
                        {tokenA}/{tokenB}
                      </span>
                    </div>
                    <div className="text-right">{rate.toFixed(6)}</div>
                    <div className="text-right">{inverseRate.toFixed(6)}</div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Liquidity</div>
                <div className="text-xl font-bold">${stats.totalLiquidity.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">24h Volume</div>
                <div className="text-xl font-bold">${stats.volume24h.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">24h Fees</div>
                <div className="text-xl font-bold">${stats.fees24h.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">24h Trades</div>
                <div className="text-xl font-bold">{stats.trades24h.toLocaleString()}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
