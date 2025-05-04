"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wallet, Gamepad2, ArrowLeftRight } from "lucide-react"
import Image from "next/image"
import MutableMarketplace from "./mutable-marketplace"
import GameSelection from "./pvp-game/game-selection"
import MatchmakingLobby from "./pvp-game/matchmaking-lobby"
import type { Connection } from "@solana/web3.js"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { ThemeToggle } from "@/components/theme-toggle"

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
}

export default function MutablePlatform({ publicKey, balance, provider, connection }: MutablePlatformProps) {
  const [activeTab, setActiveTab] = useState("games")
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [mutbBalance, setMutbBalance] = useState<number>(100) // Mock MUTB balance

  // Generate a player name from the public key
  const getPlayerName = () => {
    if (!publicKey) return "Player"
    return "Player_" + publicKey.substring(0, 4)
  }

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId)
  }

  const handleBackToSelection = () => {
    setSelectedGame(null)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="games" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 border-2 border-black bg-[#FFD54F] dark:bg-[#D4AF37] dark:border-gray-700">
          <TabsTrigger
            value="exchange"
            className="data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white font-mono"
            onClick={withClickSound()}
          >
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              <span>EXCHANGE</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="games"
            className="data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white font-mono"
            onClick={withClickSound()}
          >
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span>GAMES</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="wallet"
            className="data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white font-mono"
            onClick={withClickSound()}
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>WALLET</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exchange">
          <MutableMarketplace publicKey={publicKey} balance={balance} provider={provider} connection={connection} />
        </TabsContent>

        <TabsContent value="games">
          {selectedGame ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <SoundButton
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all dark:border-gray-700 dark:text-white dark:hover:bg-[#D4AF37] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
                  onClick={handleBackToSelection}
                >
                  Back to Game Selection
                </SoundButton>
                <Badge
                  variant="outline"
                  className="ml-auto bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono dark:bg-[#D4AF37] dark:border-gray-700 dark:text-black"
                >
                  <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
                  {mutbBalance.toFixed(2)} MUTB
                </Badge>
              </div>
              {selectedGame === "top-down-shooter" || selectedGame === "mutball-pool" ? (
                <MatchmakingLobby
                  publicKey={publicKey}
                  playerName={getPlayerName()}
                  mutbBalance={mutbBalance}
                  onExit={handleBackToSelection}
                  selectedGame={selectedGame}
                />
              ) : (
                <Card className="arcade-card">
                  <CardContent className="p-12 flex flex-col items-center justify-center">
                    <Gamepad2 size={64} className="mb-4 text-gray-700 dark:text-gray-400" />
                    <h2 className="text-3xl font-bold font-mono text-center mb-2 dark:text-white">COMING SOON</h2>
                    <p className="text-center text-gray-700 max-w-md dark:text-gray-300">
                      This game is currently in development and will be available soon!
                    </p>
                    <SoundButton
                      onClick={handleBackToSelection}
                      className="mt-8 bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono dark:bg-[#D4AF37] dark:hover:bg-[#C4A137] dark:border-gray-700 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] dark:text-black"
                    >
                      BACK TO GAMES
                    </SoundButton>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <GameSelection
              publicKey={publicKey}
              balance={balance}
              mutbBalance={mutbBalance}
              onSelectGame={handleSelectGame}
            />
          )}
        </TabsContent>

        <TabsContent value="wallet">
          <Card className="arcade-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Wallet className="h-5 w-5 dark:text-gray-300" />
                  <CardTitle className="font-mono dark:text-white">WALLET</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono dark:bg-[#D4AF37] dark:border-gray-700 dark:text-black"
                >
                  <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
                  {mutbBalance.toFixed(2)} MUTB
                </Badge>
              </div>
              <CardDescription className="dark:text-gray-300">Manage your wallet and tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                  <div className="font-bold mb-2 font-mono dark:text-white">CONNECTED WALLET</div>
                  <div className="text-sm font-mono truncate dark:text-gray-300">{publicKey}</div>
                  <div className="mt-2 text-sm dark:text-gray-300">
                    <span className="font-medium">SOL Balance:</span> {balance !== null ? balance : "Loading..."}
                  </div>
                </div>

                <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                  <div className="font-bold mb-2 font-mono dark:text-white">MUTABLE TOKENS</div>
                  <div className="flex items-center gap-2">
                    <Image src="/images/mutable-token.png" alt="MUTB" width={24} height={24} className="rounded-full" />
                    <div>
                      <div className="font-medium font-mono dark:text-white">MUTB</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">Mutable Protocol Token</div>
                    </div>
                    <div className="ml-auto font-mono dark:text-white">{mutbBalance.toFixed(2)}</div>
                  </div>
                </div>

                <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                  <div className="font-bold mb-2 font-mono dark:text-white">GAME TOKENS</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/mutable-logo-transparent.png"
                        alt="GOLD"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium font-mono dark:text-white">GOLD</div>
                        <div className="text-sm text-muted-foreground dark:text-gray-400">Fantasy RPG</div>
                      </div>
                      <div className="ml-auto font-mono dark:text-white">1,250</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/mutable-logo-transparent.png"
                        alt="GEMS"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium font-mono dark:text-white">GEMS</div>
                        <div className="text-sm text-muted-foreground dark:text-gray-400">Space Explorer</div>
                      </div>
                      <div className="ml-auto font-mono dark:text-white">350</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/mutable-logo-transparent.png"
                        alt="COINS"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium font-mono dark:text-white">COINS</div>
                        <div className="text-sm text-muted-foreground dark:text-gray-400">Crypto Racer</div>
                      </div>
                      <div className="ml-auto font-mono dark:text-white">500</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <SoundButton
                className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono dark:bg-[#D4AF37] dark:hover:bg-[#C4A137] dark:border-gray-700 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] dark:text-black"
                onClick={() => setActiveTab("exchange")}
              >
                GO TO EXCHANGE
              </SoundButton>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
