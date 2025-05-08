"use client"

import { ExternalLink } from "lucide-react"
import type { SwapResult } from "@/types/token-types"

interface TransactionHistoryProps {
  transactions: SwapResult[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Format transaction ID to shortened form
  const formatTxId = (txId: string) => {
    if (txId.length <= 12) return txId
    return `${txId.substring(0, 6)}...${txId.substring(txId.length - 6)}`
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc]">
        <h3 className="font-bold mb-4 font-mono">TRANSACTION HISTORY</h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{tx.type === "swap" ? "Swap" : "Pool Creation"}</span>
                  <span className="text-xs text-gray-500">{formatDate(tx.timestamp)}</span>
                </div>
                <div className="text-sm mb-1">
                  {tx.inputAmount.toFixed(2)} {tx.inputToken} {tx.type === "swap" ? "→" : "+"}{" "}
                  {tx.outputAmount.toFixed(2)} {tx.outputToken}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span>TX: {formatTxId(tx.txId)}</span>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.txId}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:underline flex items-center"
                  >
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No transaction history yet.</p>
            <p className="text-sm mt-2">Your transactions will appear here after you make a swap or create a pool.</p>
          </div>
        )}
      </div>
    </div>
  )
}
