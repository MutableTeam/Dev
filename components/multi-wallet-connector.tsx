"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Check, Wallet, TestTube, ChevronUp, ChevronDown } from "lucide-react"
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js"
import Image from "next/image"
import SoundButton from "./sound-button"
import { audioManager, playIntroSound, initializeAudio, loadAudioFiles } from "@/utils/audio-manager"

// Define types for Phantom wallet
type PhantomEvent = "connect" | "disconnect" | "accountChanged"

interface PhantomProvider {
  publicKey: { toString: () => string }
  isConnected: boolean
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: PhantomEvent, callback: () => void) => void
  isPhantom: boolean
}

// Define types for Solflare wallet
interface SolflareProvider {
  publicKey: { toString: () => string }
  isConnected: boolean
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  on: (event: PhantomEvent, callback: () => void) => void
  isSolflare: boolean
}

type WindowWithSolana = Window & {
  solana?: PhantomProvider
  solflare?: SolflareProvider
}

// Use devnet for testing
const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

// Wallet types
type WalletType = "phantom" | "solflare" | "test"

interface WalletInfo {
  name: string
  type: WalletType
  icon: string
  available: boolean
}

// Mock provider for test mode
const createMockProvider = () => {
  const mockPublicKey = {
    toString: () => "TestModeWallet1111111111111111111111111",
  }

  return {
    publicKey: mockPublicKey,
    isConnected: true,
    signMessage: async (message: Uint8Array) => ({ signature: new Uint8Array([1, 2, 3]) }),
    signTransaction: async (transaction: any) => transaction,
    signAllTransactions: async (transactions: any[]) => transactions,
    connect: async () => ({ publicKey: mockPublicKey }),
    disconnect: async () => {},
    on: (event: PhantomEvent, callback: () => void) => {},
    isPhantom: false,
    isSolflare: false,
    isTestMode: true,
  }
}

interface MultiWalletConnectorProps {
  onConnectionChange?: (connected: boolean, publicKey: string, balance: number | null, provider: any) => void
}

export default function MultiWalletConnector({ onConnectionChange }: MultiWalletConnectorProps) {
  const [activeWallet, setActiveWallet] = useState<WalletType | null>(null)
  const [wallets, setWallets] = useState<WalletInfo[]>([
    {
      name: "Phantom",
      type: "phantom",
      icon: "/images/phantom-wallet.png",
      available: false,
    },
    {
      name: "Solflare",
      type: "solflare",
      icon: "/images/solflare-icon.png",
      available: false,
    },
    {
      name: "Test Mode",
      type: "test",
      icon: "/placeholder.svg?height=24&width=24",
      available: true,
    },
  ])

  // Wallet state
  const [provider, setProvider] = useState<PhantomProvider | SolflareProvider | any>(null)
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string>("")
  const [balance, setBalance] = useState<number | null>(null)
  const [isTestMode, setIsTestMode] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)

  // Initialize audio manager (but don't load sounds yet)
  useEffect(() => {
    const initAudio = async () => {
      await initializeAudio()
      setIsAudioInitialized(true)
    }

    initAudio()
  }, [])

  // Check for available wallets
  useEffect(() => {
    const checkForWallets = async () => {
      const solWindow = window as WindowWithSolana

      // Check for Phantom
      const phantomAvailable = "solana" in window && solWindow.solana?.isPhantom

      // Check for Solflare
      const solflareAvailable = "solflare" in window && solWindow.solflare?.isSolflare

      setWallets((prev) =>
        prev.map((wallet) => {
          if (wallet.type === "phantom") {
            return { ...wallet, available: phantomAvailable }
          } else if (wallet.type === "solflare") {
            return { ...wallet, available: solflareAvailable }
          }
          return wallet
        }),
      )

      // Check if already connected to Phantom
      if (phantomAvailable && solWindow.solana!.isConnected && solWindow.solana!.publicKey) {
        setProvider(solWindow.solana!)
        setConnected(true)
        setPublicKey(solWindow.solana!.publicKey.toString())
        setActiveWallet("phantom")
        setIsCollapsed(true) // Minimize wallet by default for already connected wallets
      }

      // Check if already connected to Solflare
      else if (solflareAvailable && solWindow.solflare!.isConnected && solWindow.solflare!.publicKey) {
        setProvider(solWindow.solflare!)
        setConnected(true)
        setPublicKey(solWindow.solflare!.publicKey.toString())
        setActiveWallet("solflare")
        setIsCollapsed(true) // Minimize wallet by default for already connected wallets
      }
    }

    checkForWallets()
  }, [])

  // Set up wallet event listeners
  useEffect(() => {
    if (provider && !isTestMode) {
      provider.on("connect", () => {
        setConnected(true)
        if (provider.publicKey) {
          setPublicKey(provider.publicKey.toString())
        }
      })

      provider.on("disconnect", () => {
        setConnected(false)
        setPublicKey("")
        setBalance(null)
        setActiveWallet(null)
      })

      provider.on("accountChanged", () => {
        if (provider.publicKey) {
          setPublicKey(provider.publicKey.toString())
        } else {
          setConnected(false)
          setPublicKey("")
          setBalance(null)
          setActiveWallet(null)
        }
      })
    }
  }, [provider, isTestMode])

  // Fetch SOL balance when connected
  useEffect(() => {
    const getBalance = async () => {
      if (connected && publicKey) {
        if (isTestMode) {
          // Set mock balance for test mode
          setBalance(5.0)
          return
        }

        try {
          const publicKeyObj = new PublicKey(publicKey)
          const balance = await connection.getBalance(publicKeyObj)
          setBalance(balance / 1e9) // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching balance:", error)
          setBalance(null)
        }
      }
    }

    getBalance()
  }, [connected, publicKey, isTestMode])

  // Notify parent component when connection state changes
  useEffect(() => {
    if (onConnectionChange) {
      console.log("Notifying parent of connection change:", { connected, publicKey, balance })
      onConnectionChange(connected, publicKey, balance, provider)
    }
  }, [connected, publicKey, balance, provider, onConnectionChange])

  // Connect to wallet
  const connectWallet = async (walletType: WalletType) => {
    // Initialize and load audio files on first interaction
    if (isAudioInitialized && !audioManager.isSoundMuted()) {
      await loadAudioFiles()
    }

    // Handle test mode
    if (walletType === "test") {
      const mockProvider = createMockProvider()
      setProvider(mockProvider)
      setPublicKey(mockProvider.publicKey.toString())
      setConnected(true)
      setActiveWallet("test")
      setIsTestMode(true)
      setBalance(5.0) // Set mock balance
      setIsCollapsed(true) // Minimize wallet by default after connection

      // Play intro sound when wallet is connected (if not muted)
      if (!audioManager.isSoundMuted()) {
        playIntroSound()
      }
      return
    }

    const solWindow = window as WindowWithSolana
    let walletProvider: PhantomProvider | SolflareProvider | null = null

    if (walletType === "phantom") {
      if (!solWindow.solana) {
        alert("Phantom wallet not detected. Please ensure you have Phantom wallet extension installed and signed in.")
        return
      }
      walletProvider = solWindow.solana
    } else if (walletType === "solflare") {
      if (!solWindow.solflare) {
        alert("Solflare wallet not detected. Please ensure you have Solflare wallet extension installed and signed in.")
        return
      }
      walletProvider = solWindow.solflare
    }

    if (!walletProvider) return

    try {
      setLoading(true)
      if (!walletProvider.isConnected) {
        const response = await walletProvider.connect()
        setPublicKey(response.publicKey.toString())
        setConnected(true)
        setProvider(walletProvider)
        setActiveWallet(walletType)
        setIsTestMode(false)

        // Play intro sound when wallet is connected (if not muted)
        if (!audioManager.isSoundMuted()) {
          playIntroSound()
        }
        setIsCollapsed(true) // Minimize wallet by default after connection
      } else {
        console.log(`Already connected to ${walletType} Wallet`)
        // Make sure we have the publicKey even if already connected
        if (walletProvider.publicKey) {
          setPublicKey(walletProvider.publicKey.toString())
          setConnected(true)
          setProvider(walletProvider)
          setActiveWallet(walletType)
          setIsTestMode(false)

          // Play intro sound when wallet is connected (if not muted)
          if (!audioManager.isSoundMuted()) {
            playIntroSound()
          }
          setIsCollapsed(true) // Minimize wallet by default after connection
        }
      }
    } catch (error) {
      console.error(`${walletType} connection error:`, error)
      if (error instanceof Error) {
        alert(
          `Connection failed: ${error.message}. Please ensure you have ${walletType} wallet extension installed and signed in.`,
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // Disconnect from wallet
  const disconnectWallet = async () => {
    if (isTestMode) {
      // Just reset state for test mode
      setConnected(false)
      setPublicKey("")
      setBalance(null)
      setActiveWallet(null)
      setIsTestMode(false)
      setProvider(null)
      return
    }

    if (provider) {
      try {
        await provider.disconnect()
      } catch (error) {
        console.error("Disconnection error:", error)
      }
    }
  }

  // Copy address to clipboard
  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Shorten address for display
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Toggle wallet collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Render the collapsed wallet view when connected
  const renderCollapsedWallet = () => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isTestMode ? (
            <TestTube className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          ) : (
            <Image
              src={activeWallet === "phantom" ? "/images/phantom-wallet.png" : "/images/solflare-icon.png"}
              alt={activeWallet === "phantom" ? "Phantom" : "Solflare"}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <div className="flex items-center gap-1">
            <span className="text-sm font-mono dark:text-white">{shortenAddress(publicKey)}</span>
            <Badge
              variant="outline"
              className={`${
                isTestMode
                  ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700"
                  : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700"
              } font-mono text-xs`}
            >
              {isTestMode ? "TEST" : balance !== null ? `${balance} SOL` : "..."}
            </Badge>
          </div>
        </div>
        <SoundButton variant="ghost" size="icon" className="h-8 w-8" onClick={toggleCollapse}>
          <ChevronDown className="h-4 w-4" />
        </SoundButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!connected && (
        <div className="flex justify-center mb-2 sm:mb-6">
          <Image
            src="/images/mutable-logo-transparent.png"
            alt="Mutable Logo"
            width={200}
            height={200}
            className="w-32 h-32 sm:w-48 sm:h-48 md:w-[200px] md:h-[200px]"
          />
        </div>
      )}

      <Card className="w-full max-w-md mx-auto arcade-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 dark:text-gray-300" />
            <CardTitle className="font-mono dark:text-white">SOLANA WALLET</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {connected && !isCollapsed && (
              <SoundButton variant="ghost" size="icon" className="h-8 w-8" onClick={toggleCollapse}>
                <ChevronUp className="h-4 w-4" />
              </SoundButton>
            )}
          </div>
        </CardHeader>

        {connected && isCollapsed ? (
          <CardContent className="pt-4">{renderCollapsedWallet()}</CardContent>
        ) : (
          <>
            {!connected && (
              <CardDescription className="px-6 dark:text-gray-300">
                Connect your Solana wallet to use Mutable
              </CardDescription>
            )}
            <CardContent className="space-y-4">
              {connected ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-gray-300">Wallet:</span>
                    <div className="flex items-center gap-2">
                      {isTestMode ? (
                        <>
                          <TestTube className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                          <Badge
                            variant="outline"
                            className="bg-purple-100 text-purple-800 border-2 border-purple-300 font-mono dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700"
                          >
                            TEST MODE
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Image
                            src={
                              activeWallet === "phantom" ? "/images/phantom-wallet.png" : "/images/solflare-icon.png"
                            }
                            alt={activeWallet === "phantom" ? "Phantom" : "Solflare"}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <Badge
                            variant="outline"
                            className="bg-[#FFD54F] text-black border-2 border-black font-mono dark:bg-[#D4AF37] dark:border-gray-700 dark:text-black"
                          >
                            {activeWallet?.toUpperCase()}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-gray-300">Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono dark:text-white">{shortenAddress(publicKey)}</span>
                      <SoundButton variant="ghost" size="icon" className="h-8 w-8" onClick={copyAddress}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </SoundButton>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-gray-300">Status:</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 font-mono dark:bg-green-900/30 dark:text-green-200 dark:border-green-700"
                    >
                      CONNECTED
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-gray-300">Balance:</span>
                    {balance !== null ? (
                      <span className="font-mono dark:text-white">{balance} SOL</span>
                    ) : (
                      <Skeleton className="h-4 w-20 dark:bg-gray-700" />
                    )}
                  </div>
                  {isTestMode && (
                    <div className="bg-purple-50 p-3 rounded-md border border-purple-200 text-sm text-purple-800 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-200">
                      <p className="font-medium mb-1">Test Mode Active</p>
                      <p>You're using a simulated wallet for testing. No real transactions will be made.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-2">
                  <div className="grid grid-cols-1 gap-3">
                    {wallets.map((wallet) => (
                      <SoundButton
                        key={wallet.type}
                        onClick={() => connectWallet(wallet.type)}
                        disabled={loading || (wallet.type !== "test" && !wallet.available)}
                        className={`w-full border-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono justify-start h-12 ${
                          wallet.type === "test"
                            ? "bg-purple-100 hover:bg-purple-200 border-purple-300 dark:bg-purple-900/50 dark:text-purple-100 dark:border-purple-700 dark:hover:bg-purple-800/50"
                            : "bg-[#FFD54F] hover:bg-[#FFCA28] border-black dark:bg-[#D4AF37] dark:border-gray-700 dark:hover:bg-[#C4A137] dark:text-black"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {wallet.type === "test" ? (
                            <TestTube className="h-5 w-5" />
                          ) : (
                            <Image
                              src={wallet.icon || "/placeholder.svg"}
                              alt={wallet.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                          <span>{wallet.name}</span>
                          {wallet.type !== "test" && !wallet.available && (
                            <span className="text-xs ml-auto dark:text-gray-300">(Not Detected)</span>
                          )}
                        </div>
                      </SoundButton>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!connected ? (
                <div className="text-center w-full text-sm text-muted-foreground dark:text-gray-400">
                  <p>Don't have a Solana wallet?</p>
                  <div className="flex justify-center gap-4 mt-2">
                    <a
                      href="https://phantom.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Get Phantom
                    </a>
                    <a
                      href="https://solflare.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Get Solflare
                    </a>
                  </div>
                </div>
              ) : (
                <SoundButton
                  variant="outline"
                  className={`w-full border-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono ${
                    isTestMode
                      ? "border-purple-300 hover:bg-purple-100 dark:border-purple-700 dark:hover:bg-purple-900/50 dark:text-purple-100"
                      : "border-black hover:bg-[#FFD54F] dark:border-gray-700 dark:hover:bg-[#D4AF37] dark:text-white"
                  }`}
                  onClick={disconnectWallet}
                >
                  DISCONNECT
                </SoundButton>
              )}
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
