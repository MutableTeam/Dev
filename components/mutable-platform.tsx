"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wallet, Gamepad2, ArrowLeftRight, Smartphone, Code, Mail, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import MutableMarketplace from "./mutable-marketplace"
import GameSelection from "./pvp-game/game-selection"
import MatchmakingLobby from "./pvp-game/matchmaking-lobby"
import type { Connection } from "@solana/web3.js"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { trackEvent } from "@/utils/analytics"
import LastStandGameLauncher from "@/games/last-stand/game-launcher"

// Add responsive styles for tabs
const tabStyles = {
  container: "sticky top-0 z-30 bg-opacity-100 w-full",
  list: "mb-4 border-2 border-black bg-[#FFD54F] dark:bg-[#D4AF37] dark:border-gray-700 w-full grid grid-cols-5 p-0 h-auto",
  trigger:
    "data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white font-mono py-2 px-1 h-auto flex flex-col items-center justify-center",
}

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
}

export default function MutablePlatform({ publicKey, balance, provider, connection }: MutablePlatformProps) {
  const [activeTab, setActiveTab] = useState("desktop-games")
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [mutbBalance, setMutbBalance] = useState<number>(100) // Mock MUTB balance
  // Local state to track balance changes without waiting for blockchain updates
  const [localBalance, setLocalBalance] = useState<number | null>(balance)

  // Update useEffect to sync localBalance with balance from props
  useEffect(() => {
    setLocalBalance(balance)
  }, [balance])

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

  const handleDeveloperContact = () => {
    // Track developer contact event
    trackEvent("developer_contact", { source: "develop_tab" })
    window.location.href =
      "mailto:mutableexchange@gmail.com?subject=Game%20Developer%20Submission&body=I'm%20interested%20in%20developing%20a%20game%20for%20the%20Mutable%20platform.%0A%0AGame%20Name:%20%0AGame%20Type:%20%0ABrief%20Description:%20%0A%0AThank%20you!"
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="desktop-games" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className={tabStyles.container}>
          <TabsList className={tabStyles.list}>
            <TabsTrigger value="exchange" className={tabStyles.trigger} onClick={withClickSound()}>
              <ArrowLeftRight className="h-4 w-4 mb-1" />
              <span className="text-xs sm:text-sm whitespace-normal text-center">EXCHANGE</span>
            </TabsTrigger>
            <TabsTrigger value="desktop-games" className={tabStyles.trigger} onClick={withClickSound()}>
              <Gamepad2 className="h-4 w-4 mb-1" />
              <span className="text-xs sm:text-sm whitespace-normal text-center">DESKTOP</span>
            </TabsTrigger>
            <TabsTrigger value="mobile-games" className={tabStyles.trigger} onClick={withClickSound()}>
              <Smartphone className="h-4 w-4 mb-1" />
              <span className="text-xs sm:text-sm whitespace-normal text-center">MOBILE</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className={tabStyles.trigger} onClick={withClickSound()}>
              <Wallet className="h-4 w-4 mb-1" />
              <span className="text-xs sm:text-sm whitespace-normal text-center">WALLET</span>
            </TabsTrigger>
            <TabsTrigger value="develop" className={tabStyles.trigger} onClick={withClickSound()}>
              <Code className="h-4 w-4 mb-1" />
              <span className="text-xs sm:text-sm whitespace-normal text-center">DEVELOP</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-[500px]">
          <TabsContent value="exchange" className="mt-0 h-full">
            {activeTab === "exchange" && (
              <MutableMarketplace
                publicKey={publicKey}
                balance={localBalance}
                provider={provider}
                connection={connection}
                onBalanceChange={(currency, newBalance) => {
                  if (currency === "sol") {
                    // Update the SOL balance in the parent component
                    setLocalBalance(newBalance)
                  }
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="desktop-games" className="mt-0 h-full">
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
                ) : selectedGame === "archer-arena" ? (
                  <div className="space-y-4">
                    <LastStandGameLauncher
                      publicKey={publicKey}
                      playerName={getPlayerName()}
                      mutbBalance={mutbBalance}
                      onExit={handleBackToSelection}
                    />
                  </div>
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
                balance={localBalance}
                mutbBalance={mutbBalance}
                onSelectGame={handleSelectGame}
              />
            )}
          </TabsContent>

          <TabsContent value="mobile-games" className="mt-0 h-full">
            <Card className="arcade-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 dark:text-gray-300" />
                    <CardTitle className="font-mono dark:text-white">MOBILE GAMES</CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono dark:bg-[#D4AF37] dark:border-gray-700 dark:text-black"
                  >
                    <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
                    {mutbBalance.toFixed(2)} MUTB
                  </Badge>
                </div>
                <CardDescription className="dark:text-gray-300">
                  Play games optimized for mobile devices
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="p-8 border-2 border-black rounded-lg bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600 text-center">
                  <div className="flex justify-center mb-6">
                    <Smartphone size={64} className="text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold font-mono mb-4 dark:text-white">Mobile Gaming Coming Soon!</h3>
                  <p className="text-lg mb-6 dark:text-gray-300">
                    We're working on bringing the Mutable gaming experience to your mobile devices. Stay tuned for
                    exciting mobile-optimized games with the same play-to-earn mechanics!
                  </p>
                  <div className="inline-flex items-center gap-2 bg-[#FFD54F] px-4 py-2 rounded-md border-2 border-black dark:bg-[#D4AF37] dark:border-gray-700">
                    <Smartphone className="h-5 w-5" />
                    <span className="font-medium">Mobile beta launching Q3 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="mt-0 h-full">
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
                      <span className="font-medium">SOL Balance:</span>{" "}
                      {localBalance !== null ? localBalance : "Loading..."}
                    </div>
                  </div>

                  <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                    <div className="font-bold mb-2 font-mono dark:text-white">MUTABLE TOKENS</div>
                    <div className="flex items-center gap-2">
                      <Image
                        src="/images/mutable-token.png"
                        alt="MUTB"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
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
                          height={14}
                          className="rounded-full object-contain"
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
                          height={14}
                          className="rounded-full object-contain"
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
                          height={14}
                          className="rounded-full object-contain"
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

          <TabsContent value="develop" className="mt-0 h-full">
            <Card className="arcade-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 dark:text-gray-300" />
                    <CardTitle className="font-mono dark:text-white">GAME DEVELOPERS</CardTitle>
                  </div>
                </div>
                <CardDescription className="dark:text-gray-300">
                  Build games for the Mutable platform and earn revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                      <h3 className="font-bold mb-2 font-mono text-lg dark:text-white">WHY DEVELOP FOR MUTABLE?</h3>
                      <ul className="space-y-2 text-sm dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Revenue sharing from in-game transactions and token swaps</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Access to our growing player base and marketing support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Integration with Solana blockchain and MUTB token ecosystem</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Technical support for blockchain integration and game development</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                      <h3 className="font-bold mb-2 font-mono text-lg dark:text-white">REQUIREMENTS</h3>
                      <ul className="space-y-2 text-sm dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>Games must be compatible with our platform's architecture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>Integration with MUTB token for in-game transactions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>Adherence to our content guidelines and quality standards</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>Regular updates and maintenance of your game</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                      <h3 className="font-bold mb-2 font-mono text-lg dark:text-white">DEVELOPMENT RESOURCES</h3>
                      <p className="text-sm mb-4 dark:text-gray-300">
                        We provide resources to help you develop games for our platform:
                      </p>
                      <ul className="space-y-2 text-sm dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>API documentation for platform integration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>SDK for Solana and MUTB token integration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Design guidelines for the retro arcade aesthetic</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Technical support during development</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                      <h3 className="font-bold mb-2 font-mono text-lg dark:text-white">CONTACT US</h3>
                      <p className="text-sm mb-4 dark:text-gray-300">
                        Interested in developing games for the Mutable platform? We'd love to hear from you! Contact us
                        directly to discuss your game ideas, get technical support, or learn more about our developer
                        program.
                      </p>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-md border-2 border-black dark:border-gray-600 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <span className="font-mono font-bold dark:text-white">Email Us</span>
                        </div>
                        <p className="text-sm mb-3 dark:text-gray-300">
                          Send us your game concept, portfolio, or questions:
                        </p>
                        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="font-mono text-sm dark:text-gray-300">mutableexchange@gmail.com</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm dark:text-gray-300">
                          <span className="font-bold">What to include in your email:</span>
                        </p>
                        <ul className="text-sm list-disc pl-5 dark:text-gray-300 space-y-1">
                          <li>Brief description of your game concept</li>
                          <li>Your development experience or portfolio</li>
                          <li>Technical questions or requirements</li>
                          <li>Timeline for development</li>
                        </ul>
                      </div>

                      <SoundButton
                        onClick={handleDeveloperContact}
                        className="w-full mt-4 bg-[#4CAF50] hover:bg-[#45a049] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono dark:border-gray-700 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
                      >
                        <Mail className="h-4 w-4 mr-2" /> CONTACT US NOW
                      </SoundButton>
                    </div>

                    <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                      <h3 className="font-bold mb-2 font-mono text-lg dark:text-white">UPCOMING FEATURES</h3>
                      <p className="text-sm mb-4 dark:text-gray-300">
                        We're expanding our platform with these upcoming features:
                      </p>
                      <ul className="space-y-2 text-sm dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Developer dashboard for analytics and revenue tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Cross-game asset marketplace for NFTs and in-game items</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Tournament and leaderboard infrastructure</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600">
                      <h3 className="font-bold mb-2 font-mono text-lg dark:text-white">TECHNOLOGY STACK</h3>
                      <p className="text-sm mb-4 dark:text-gray-300">
                        The Mutable platform is built using modern web technologies:
                      </p>
                      <ul className="space-y-2 text-sm dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Node.js backend for high-performance game servers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>React frontend for responsive and interactive UI</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>Solana blockchain integration for secure transactions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>WebSocket for real-time multiplayer functionality</span>
                        </li>
                      </ul>
                      <p className="text-sm mt-4 dark:text-gray-300">
                        Developers can use our SDK and APIs to integrate with our Node.js and React-based platform.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-center w-full dark:text-gray-300">
                  <p>Join our growing ecosystem of game developers and earn revenue through the Mutable platform!</p>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-gray-400">
                    All games are reviewed for quality and compliance before being added to the platform.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
