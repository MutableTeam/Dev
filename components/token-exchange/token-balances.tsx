"use client"
import { RefreshCw, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useExchange } from "../../contexts/exchange-context"

export default function TokenBalances() {
  const { tokenBalances, totalBalanceUsd, isLoadingBalances, refreshBalances } = useExchange()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Your Balances</CardTitle>
          <CardDescription>Your token holdings</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={refreshBalances} disabled={isLoadingBalances}>
          {isLoadingBalances ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Balance</div>
          <div className="text-2xl font-bold">${totalBalanceUsd.toFixed(2)}</div>
        </div>

        <div className="space-y-4">
          {isLoadingBalances ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : tokenBalances.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No tokens found in your wallet</div>
          ) : (
            tokenBalances.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <img
                    src={token.logoURI || "/placeholder.svg"}
                    alt={token.symbol}
                    className="w-8 h-8 mr-3 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{token.balance.toFixed(6)}</div>
                  <div className="text-sm text-gray-500">${token.usdValue.toFixed(2)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
