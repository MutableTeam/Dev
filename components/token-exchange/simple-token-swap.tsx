"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownUp, Loader2 } from "lucide-react"

// Fixed MUTB price at $0.01
const MUTB_PRICE_USD = 0.01

// Mock function to simulate a swap
async function simulateSwap(
  fromToken: "SOL" | "MUTB",
  toToken: "SOL" | "MUTB",
  amount: number,
): Promise<{ success: boolean; outputAmount: number }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simple exchange rate calculation
  // SOL to MUTB: 1 SOL = 10000 MUTB (at $100 per SOL and $0.01 per MUTB)
  // MUTB to SOL: 10000 MUTB = 1 SOL

  let outputAmount = 0
  if (fromToken === "SOL" && toToken === "MUTB") {
    outputAmount = amount * 10000 // 1 SOL = 10000 MUTB
  } else if (fromToken === "MUTB" && toToken === "SOL") {
    outputAmount = amount / 10000 // 10000 MUTB = 1 SOL
  }

  return {
    success: true,
    outputAmount,
  }
}

export function SimpleTokenSwap() {
  // Token selection (fixed to SOL and MUTB)
  const [fromToken, setFromToken] = useState<"SOL" | "MUTB">("SOL")
  const [toToken, setToToken] = useState<"SOL" | "MUTB">("MUTB")

  // Amount inputs
  const [fromAmount, setFromAmount] = useState("1")
  const [toAmount, setToAmount] = useState("")

  // Swap state
  const [isLoading, setIsLoading] = useState(false)
  const [swapStatus, setSwapStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  // Update the output amount when input changes
  useEffect(() => {
    const updateOutputAmount = async () => {
      if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
        setToAmount("")
        return
      }

      setIsLoading(true)

      try {
        const result = await simulateSwap(fromToken, toToken, Number.parseFloat(fromAmount))

        if (result.success) {
          setToAmount(result.outputAmount.toFixed(toToken === "SOL" ? 9 : 6))
        }
      } catch (error) {
        console.error("Error calculating swap:", error)
      } finally {
        setIsLoading(false)
      }
    }

    updateOutputAmount()
  }, [fromToken, toToken, fromAmount])

  // Swap tokens (flip from/to)
  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  // Execute the swap
  const handleSwap = async () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) return

    setSwapStatus("loading")
    setStatusMessage("Processing swap...")

    try {
      const result = await simulateSwap(fromToken, toToken, Number.parseFloat(fromAmount))

      if (result.success) {
        setSwapStatus("success")
        setStatusMessage(
          `Successfully swapped ${fromAmount} ${fromToken} for ${result.outputAmount.toFixed(toToken === "SOL" ? 9 : 6)} ${toToken}`,
        )
      } else {
        setSwapStatus("error")
        setStatusMessage("Swap failed. Please try again.")
      }
    } catch (error) {
      console.error("Error executing swap:", error)
      setSwapStatus("error")
      setStatusMessage("An error occurred while processing the swap.")
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setSwapStatus("idle")
      setStatusMessage("")
    }, 5000)
  }

  // Get token logo
  const getTokenLogo = (token: "SOL" | "MUTB") => {
    return token === "SOL" ? "/solana-logo.png" : "/images/mutable-token.png"
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Swap SOL ⇄ MUTB</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* From token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img
                src={getTokenLogo(fromToken) || "/placeholder.svg"}
                alt={fromToken}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = "/digital-token.png"
                }}
              />
              <span className="font-medium">{fromToken}</span>
            </div>
          </div>

          <Input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.00"
            className="text-lg"
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <Button variant="outline" size="icon" onClick={handleSwapTokens} className="rounded-full h-10 w-10">
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* To token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img
                src={getTokenLogo(toToken) || "/placeholder.svg"}
                alt={toToken}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = "/digital-token.png"
                }}
              />
              <span className="font-medium">{toToken}</span>
            </div>
          </div>

          <Input type="text" value={toAmount} readOnly placeholder="0.00" className="text-lg bg-gray-50" />
        </div>

        {/* Exchange rate */}
        <div className="text-sm text-gray-500 text-center">
          {fromToken === "SOL" ? <span>1 SOL = 10,000 MUTB</span> : <span>10,000 MUTB = 1 SOL</span>}
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`text-sm p-2 rounded text-center ${
              swapStatus === "error"
                ? "bg-red-50 text-red-500"
                : swapStatus === "success"
                  ? "bg-green-50 text-green-500"
                  : "bg-blue-50 text-blue-500"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Swap button */}
        <Button
          className="w-full"
          onClick={handleSwap}
          disabled={isLoading || swapStatus === "loading" || !fromAmount || Number.parseFloat(fromAmount) <= 0}
        >
          {swapStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : (
            "Swap"
          )}
        </Button>

        {/* Note about MUTB price */}
        <div className="text-xs text-center text-gray-500">MUTB token price is fixed at $0.01</div>
      </CardContent>
    </Card>
  )
}
