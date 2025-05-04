"use client"

import { useState, useEffect } from "react"
import MultiWalletConnector from "@/components/multi-wallet-connector"
import DemoWatermark from "@/components/demo-watermark"
import PromoWatermark from "@/components/promo-watermark"
import GlobalAudioControls from "@/components/global-audio-controls"
import DebugOverlay from "@/components/debug-overlay"
import { registerGames } from "@/games/registry"
import MutablePlatform from "@/components/mutable-platform"
import RetroArcadeBackground from "@/components/retro-arcade-background"
import { Connection, clusterApiUrl } from "@solana/web3.js"
import "@/styles/retro-arcade.css"

export default function Home() {
  // Wallet connection state
  const [walletConnected, setWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [provider, setProvider] = useState<any>(null)

  // Initialize games registry
  useEffect(() => {
    registerGames()
  }, [])

  const handleWalletConnection = (connected: boolean, publicKey: string, balance: number | null, provider: any) => {
    console.log("Wallet connection changed:", { connected, publicKey, balance })
    setWalletConnected(connected)
    setPublicKey(publicKey)
    setBalance(balance)
    setProvider(provider)
  }

  // Create a connection object for Solana
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  return (
    <main className="min-h-screen">
      <RetroArcadeBackground>
        <div className="max-w-6xl mx-auto p-4 md:p-8 z-10 relative">
          {/* Audio controls in the top right */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
            <GlobalAudioControls />
          </div>

          {/* Wallet connector - centered when not connected, compact at top when connected */}
          <div className={walletConnected ? "fixed top-2 right-2 z-50 max-w-[300px]" : "flex justify-center"}>
            <MultiWalletConnector
              onConnectionChange={handleWalletConnection}
              compact={walletConnected}
              className={!walletConnected ? "logo-glow" : ""}
            />
          </div>

          <DemoWatermark />
          <PromoWatermark />

          {walletConnected && publicKey && (
            <div className="mt-16">
              <MutablePlatform publicKey={publicKey} balance={balance} provider={provider} connection={connection} />
            </div>
          )}

          <DebugOverlay initiallyVisible={false} position="bottom-right" />
        </div>
      </RetroArcadeBackground>
    </main>
  )
}
