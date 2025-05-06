"use client"

import { SimpleTokenSwap } from "./simple-token-swap"

export function SimpleExchangeContainer() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">SOL/MUTB Token Exchange</h1>
          <p className="text-center text-gray-500">Swap between SOL and MUTB tokens</p>
        </div>

        <SimpleTokenSwap />

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>This is a simulated token exchange between SOL and MUTB.</p>
          <p className="mt-1">MUTB token address: 5R3KsVN6fucM7Mxyob4oro5Xp3qMxAb7Vi4L4Di57jCY</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleExchangeContainer
