"use client"

import { useState } from "react"
import type { Connection, PublicKey } from "@solana/web3.js"
import { WalletConnect } from "./wallet-connect"
import { TokenSwap } from "./token-swap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ExchangeContainer() {
  const [connection, setConnection] = useState<Connection | null>(null)
  const [wallet, setWallet] = useState<PublicKey | null>(null)

  // Handle wallet connection
  const handleConnect = (conn: Connection, walletPubkey: PublicKey) => {
    setConnection(conn)
    setWallet(walletPubkey)
  }

  // Mock sign transaction function
  const signTransaction = async (transaction: any) => {
    // In a real app, this would use the wallet adapter
    return transaction
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mutable Token Exchange</CardTitle>
          <CardDescription>Swap tokens on Solana Devnet</CardDescription>
        </CardHeader>
        <CardContent>
          <WalletConnect onConnect={handleConnect} />
        </CardContent>
      </Card>

      {connection && wallet ? (
        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="pool">Liquidity</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="mt-4">
            <TokenSwap
              connection={connection}
              wallet={wallet}
              signTransaction={signTransaction}
              onSwapComplete={() => console.log("Swap completed")}
            />
          </TabsContent>

          <TabsContent value="pool" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Pools</CardTitle>
                <CardDescription>Add or remove liquidity from pools</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-center text-gray-500">Liquidity pool features coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View your recent transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-center text-gray-500">Transaction history coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-500">Please connect your wallet to use the exchange</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ExchangeContainer
