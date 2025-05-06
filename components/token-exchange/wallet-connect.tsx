"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Connection, clusterApiUrl, type PublicKey } from "@solana/web3.js"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface WalletConnectProps {
  onConnect: (connection: Connection, wallet: PublicKey) => void
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const { publicKey, connected } = useWallet()
  const [isDevnet, setIsDevnet] = useState<boolean | null>(null)
  const [connection, setConnection] = useState<Connection | null>(null)

  // Check if connected to devnet
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        // Create connection to devnet
        const conn = new Connection(clusterApiUrl("devnet"))
        setConnection(conn)

        // For demo purposes, we'll just assume we're on devnet
        // In a real app, you'd check the actual network
        setIsDevnet(true)
      } catch (error) {
        console.error("Error checking network:", error)
        setIsDevnet(false)
      }
    }

    checkNetwork()
  }, [])

  // Trigger onConnect when wallet is connected and we're on devnet
  useEffect(() => {
    if (connected && publicKey && isDevnet && connection) {
      onConnect(connection, publicKey)
    }
  }, [connected, publicKey, isDevnet, connection, onConnect])

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Connect Wallet</h2>

      {isDevnet === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Network Error</AlertTitle>
          <AlertDescription>Please connect to Solana Devnet to use the token exchange.</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          {connected && publicKey ? (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Connected:</span>
              <span className="font-mono text-xs truncate max-w-[200px]">{publicKey.toString()}</span>
            </div>
          ) : (
            <span>Not connected</span>
          )}
        </div>

        <WalletMultiButton />
      </div>

      {connected && publicKey && isDevnet && (
        <div className="text-sm text-green-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
          Connected to Devnet
        </div>
      )}
    </div>
  )
}
