"use client"

import { useState, useEffect } from "react"
import type { Connection, PublicKey } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowDownUp, Check } from "lucide-react"
import { TOKEN_REGISTRY } from "@/utils/token-utils"
import { getExchangeService } from "@/services/exchange-service"

interface TokenSwapProps {
  connection: Connection
  wallet: PublicKey
  signTransaction: (transaction: any) => Promise<any>
  onSwapComplete?: () => void
}

export function TokenSwap({ connection, wallet, signTransaction, onSwapComplete }: TokenSwapProps) {
  // Token selection
  const [fromToken, setFromToken] = useState("SOL")
  const [toToken, setToToken] = useState("MUTB")

  // Amount inputs
  const [fromAmount, setFromAmount] = useState("1")
  const [toAmount, setToAmount] = useState("")

  // Swap state
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isExecutingSwap, setIsExecutingSwap] = useState(false)
  const [swapError, setSwapError] = useState<string | null>(null)
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null)

  // Exchange info
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [priceImpact, setPriceImpact] = useState<number>(0)

  // Get the exchange service
  const exchangeService = getExchangeService(connection)

  // Update quote when inputs change
  useEffect(() => {
    updateQuote()
  }, [fromToken, toToken, fromAmount])

  // Update the quote
  const updateQuote = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setToAmount("")
      setExchangeRate(null)
      setPriceImpact(0)
      return
    }

    setIsLoadingQuote(true)
    setSwapError(null)

    try {
      // Get a swap quote
      const quote = await exchangeService.getSwapQuote({
        fromToken,
        toToken,
        amount: Number.parseFloat(fromAmount),
        slippageTolerance: 0.5, // 0.5% slippage tolerance
      })

      setToAmount(quote.outputAmount.toFixed(6))
      setExchangeRate(quote.exchangeRate)
      setPriceImpact(quote.priceImpact)
    } catch (error) {
      console.error("Error getting swap quote:", error)
      setSwapError("Failed to get swap quote")
      setToAmount("")
      setExchangeRate(null)
      setPriceImpact(0)
    } finally {
      setIsLoadingQuote(false)
    }
  }

  // Execute the swap
  const executeSwap = async () => {
    setIsExecutingSwap(true)
    setSwapError(null)
    setSwapSuccess(null)

    try {
      // Execute the swap
      const txid = await exchangeService.executeSwap(
        {
          fromToken,
          toToken,
          amount: Number.parseFloat(fromAmount),
          slippageTolerance: 0.5, // 0.5% slippage tolerance
        },
        wallet,
        signTransaction,
      )

      setSwapSuccess(`Swap successful! Transaction ID: ${txid.slice(0, 8)}...`)

      // Notify parent component
      if (onSwapComplete) {
        onSwapComplete()
      }
    } catch (error) {
      console.error("Error executing swap:", error)
      setSwapError(error instanceof Error ? error.message : "Swap failed")
    } finally {
      setIsExecutingSwap(false)
    }
  }

  // Swap tokens
  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Swap Tokens</CardTitle>
        <CardDescription>Exchange tokens at the best rates</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* From token */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">From</label>
            <span className="text-sm text-gray-500">Balance: {/* Display balance here */}</span>
          </div>

          <div className="flex space-x-2">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(TOKEN_REGISTRY).map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    <div className="flex items-center gap-2">
                      <img
                        src={TOKEN_REGISTRY[symbol].logoURI || "/placeholder.svg"}
                        alt={symbol}
                        className="w-5 h-5 rounded-full"
                      />
                      {symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1"
            />
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <Button variant="outline" size="icon" onClick={swapTokens} className="rounded-full">
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* To token */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">To</label>
            <span className="text-sm text-gray-500">Balance: {/* Display balance here */}</span>
          </div>

          <div className="flex space-x-2">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(TOKEN_REGISTRY).map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    <div className="flex items-center gap-2">
                      <img
                        src={TOKEN_REGISTRY[symbol].logoURI || "/placeholder.svg"}
                        alt={symbol}
                        className="w-5 h-5 rounded-full"
                      />
                      {symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="number" value={toAmount} readOnly placeholder="0.00" className="flex-1 bg-gray-50" />
          </div>
        </div>

        {/* Exchange rate */}
        {exchangeRate && (
          <div className="text-sm text-gray-500 flex justify-between">
            <span>Exchange Rate:</span>
            <span>
              1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}
            </span>
          </div>
        )}

        {/* Price impact */}
        {priceImpact > 0 && (
          <div className="text-sm flex justify-between">
            <span>Price Impact:</span>
            <span className={priceImpact > 5 ? "text-red-500" : priceImpact > 2 ? "text-yellow-500" : "text-green-500"}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
        )}

        {/* Error message */}
        {swapError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{swapError}</AlertDescription>
          </Alert>
        )}

        {/* Success message */}
        {swapSuccess && (
          <Alert variant="success" className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Success</AlertTitle>
            <AlertDescription className="text-green-600">{swapSuccess}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={executeSwap}
          disabled={isLoadingQuote || isExecutingSwap || !fromAmount || Number.parseFloat(fromAmount) <= 0 || !toAmount}
        >
          {isExecutingSwap ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : (
            "Swap"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
