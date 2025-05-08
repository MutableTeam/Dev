"use client"
import { Info, ExternalLink, Loader2 } from "lucide-react"
import SoundButton from "@/components/sound-button"
import { useToast } from "@/components/ui/use-toast"
import type { TokenConfig } from "@/types/token-types"

interface LiquidityPoolStatusProps {
  tokenA: TokenConfig
  tokenB: TokenConfig
  isTokenTradable: boolean
  checkingTradability: boolean
  onCheckTradability: () => Promise<boolean>
}

export function LiquidityPoolStatus({
  tokenA,
  tokenB,
  isTokenTradable,
  checkingTradability,
  onCheckTradability,
}: LiquidityPoolStatusProps) {
  const { toast } = useToast()

  const handleCheckStatus = async () => {
    try {
      const tradable = await onCheckTradability()

      toast({
        title: tradable ? "Token is Tradable!" : "Token Not Yet Tradable",
        description: tradable
          ? `Your ${tokenA.symbol} token is now tradable on Jupiter.`
          : `Your token is not yet indexed by Jupiter. Please check back later.`,
        variant: "default",
        className: tradable
          ? "border-2 border-green-500 bg-green-50 text-green-800"
          : "border-2 border-yellow-500 bg-yellow-50 text-yellow-800",
      })
    } catch (error) {
      console.error("Error checking token tradability:", error)
      toast({
        title: "Error Checking Token",
        description: "Failed to check if your token is tradable. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <h3 className="font-bold mb-2 font-mono">LIQUIDITY POOL STATUS</h3>
        <div
          className={`bg-${isTokenTradable ? "green" : "yellow"}-100 border border-${isTokenTradable ? "green" : "yellow"}-300 p-3 rounded-md text-sm mb-3`}
        >
          <p className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              {isTokenTradable
                ? `Your ${tokenA.symbol} token is now tradable on Jupiter! The liquidity pool has been successfully created and indexed.`
                : `Your liquidity pool has been created but may not be indexed by Jupiter yet. This typically takes 24-48 hours.`}
            </span>
          </p>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between">
            <span className="text-sm">Pool Status:</span>
            <span className="text-sm font-medium">
              {isTokenTradable ? (
                <span className="text-green-600">Active & Indexed</span>
              ) : (
                <span className="text-yellow-600">Created, Awaiting Indexing</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Jupiter Integration:</span>
            <span className="text-sm font-medium">
              {isTokenTradable ? (
                <span className="text-green-600">Available</span>
              ) : (
                <span className="text-yellow-600">Pending</span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <a
            href={`https://explorer.solana.com/address/${tokenA.mintAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center text-sm"
          >
            View {tokenA.symbol} Token on Solana Explorer <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>

      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <h3 className="font-bold mb-2 font-mono">CHECK JUPITER INTEGRATION</h3>
        <p className="text-sm mb-3">You can manually check if your token is tradable on Jupiter using these methods:</p>
        <ol className="list-decimal list-inside text-sm space-y-2">
          <li>
            <strong>Jupiter Swap UI:</strong> Visit{" "}
            <a
              href={`https://jup.ag/swap/${tokenB.symbol}-${tokenA.symbol}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Jupiter Swap
            </a>{" "}
            and try to swap {tokenB.symbol} to {tokenA.symbol}.
          </li>
          <li>
            <strong>API Check:</strong> Use the Jupiter API to check if your token is tradable by making a request to:{" "}
            <code className="bg-gray-100 p-1 rounded">
              https://quote-api.jup.ag/v6/quote?inputMint={tokenB.mintAddress}&outputMint={tokenA.mintAddress}
              &amount=10000000
            </code>
          </li>
          <li>
            <strong>Refresh Token Status:</strong> Click the button below to check if your token is now tradable on
            Jupiter.
          </li>
        </ol>
        <div className="mt-4">
          <SoundButton
            className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            onClick={handleCheckStatus}
            disabled={checkingTradability}
          >
            {checkingTradability ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                CHECKING...
              </span>
            ) : (
              "CHECK TOKEN STATUS"
            )}
          </SoundButton>
        </div>
      </div>
    </div>
  )
}
