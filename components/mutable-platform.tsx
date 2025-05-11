"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, ArrowLeftRight, Smartphone, Code, Mail, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import MutableMarketplace from "./mutable-marketplace"
import GameSelection from "./pvp-game/game-selection"
import MatchmakingLobby from "./pvp-game/matchmaking-lobby"
import type { Connection } from "@solana/web3.js"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { trackEvent } from "@/utils/analytics"
import LastStandGameLauncher from "@/games/last-stand/game-launcher"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk styled components
const glitchAnim1 = keyframes`
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: translate(-2px, 2px);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: translate(1px, 3px);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: translate(-1px, -3px);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: translate(3px, 1px);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: translate(-3px, -2px);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    transform: translate(2px, -1px);
  }
`

const glitchAnim2 = keyframes`
  0% {
    clip-path: inset(24% 0 29% 0);
    transform: translate(2px, -2px);
  }
  20% {
    clip-path: inset(54% 0 26% 0);
    transform: translate(-3px, 1px);
  }
  40% {
    clip-path: inset(9% 0 38% 0);
    transform: translate(1px, 3px);
  }
  60% {
    clip-path: inset(23% 0 75% 0);
    transform: translate(3px, -1px);
  }
  80% {
    clip-path: inset(74% 0 26% 0);
    transform: translate(-2px, 2px);
  }
  100% {
    clip-path: inset(46% 0 11% 0);
    transform: translate(2px, -2px);
  }
`

const flickerAnim = keyframes`
  0% {
    opacity: 0.1;
  }
  2% {
    opacity: 0.9;
  }
  4% {
    opacity: 0.3;
  }
  8% {
    opacity: 0.8;
  }
  70% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`

const CyberTabsList = styled(TabsList)`
  background: rgba(10, 10, 40, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.2;
    pointer-events: none;
    z-index: 1;
  }
  
  &::before {
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
    animation: ${flickerAnim} 4s linear infinite;
  }
  
  &::after {
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.2), transparent);
    animation: ${flickerAnim} 7s linear infinite reverse;
  }
`

const CyberTabsTrigger = styled(TabsTrigger)`
  color: rgba(150, 200, 255, 0.7);
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &[data-state="active"] {
    color: rgba(0, 255, 255, 0.9);
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
    background: transparent;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: rgba(0, 255, 255, 0.8);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
    }
    
    // Glitch effect for active tab
    &::before {
      content: attr(data-value);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      color: rgba(255, 0, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: ${glitchAnim1} 4s infinite linear alternate-reverse;
      z-index: -1;
      opacity: 0.5;
    }
  }
  
  &:hover:not([data-state="active"]) {
    color: rgba(150, 220, 255, 0.9);
    background: rgba(0, 100, 200, 0.1);
    
    // Glitch effect on hover
    &::before {
      content: attr(data-value);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      color: rgba(0, 255, 255, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: ${glitchAnim2} 3s infinite linear alternate-reverse;
      z-index: -1;
      opacity: 0.3;
    }
  }
`

// Add responsive styles for tabs
const tabStyles = {
  container: "sticky top-0 z-30 bg-opacity-100 w-full",
  list: "mb-6 border-2 border-black bg-[#FFD54F] dark:bg-[#D4AF37] dark:border-gray-700 w-full grid grid-cols-4 p-0 h-auto",
  trigger:
    "data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white font-mono py-2 px-1 h-auto flex flex-col items-center justify-center text-center",
}

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: Connection
}

export default function MutablePlatform({ publicKey, balance, provider, connection }: MutablePlatformProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

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
      "mailto:mutablepvp@gmail.com?subject=Game%20Developer%20Submission&body=I'm%20interested%20in%20developing%20a%20game%20for%20the%20Mutable%20platform.%0A%0AGame%20Name:%20%0AGame%20Type:%20%0ABrief%20Description:%20%0A%0AThank%20you!"
  }

  return (
    <div className="space-y-4 w-full">
      <Tabs defaultValue="desktop-games" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className={isCyberpunk ? "" : tabStyles.container}>
          {isCyberpunk ? (
            <CyberTabsList className="w-full grid grid-cols-4 p-0 h-auto">
              <CyberTabsTrigger value="exchange" data-value="EXCHANGE" onClick={withClickSound()}>
                <ArrowLeftRight className="h-4 w-4 mb-1 mx-auto" />
                <span className="text-xs sm:text-sm whitespace-normal text-center">EXCHANGE</span>
              </CyberTabsTrigger>
              <CyberTabsTrigger value="desktop-games" data-value="DESKTOP" onClick={withClickSound()}>
                <Gamepad2 className="h-4 w-4 mb-1 mx-auto" />
                <span className="text-xs sm:text-sm whitespace-normal text-center">DESKTOP</span>
              </CyberTabsTrigger>
              <CyberTabsTrigger value="mobile-games" data-value="MOBILE" onClick={withClickSound()}>
                <Smartphone className="h-4 w-4 mb-1 mx-auto" />
                <span className="text-xs sm:text-sm whitespace-normal text-center">MOBILE</span>
              </CyberTabsTrigger>
              <CyberTabsTrigger value="develop" data-value="DEVELOP" onClick={withClickSound()}>
                <Code className="h-4 w-4 mb-1 mx-auto" />
                <span className="text-xs sm:text-sm whitespace-normal text-center">DEVELOP</span>
              </CyberTabsTrigger>
            </CyberTabsList>
          ) : (
            <TabsList className={tabStyles.list}>
              <TabsTrigger value="exchange" className={tabStyles.trigger} onClick={withClickSound()}>
                <ArrowLeftRight className="h-4 w-4 mb-1 mx-auto" />
                <span className="text-xs sm:text-sm whitespace-normal text-center">EXCHANGE</span>
              </TabsTrigger>
              <TabsTrigger value="desktop-games" className={tabStyles.trigger} onClick={withClickSound()}>
                <Gamepad2 className="h-4 w-4 mb-1 mx-auto" />
                <span className="text-xs sm:text-sm whitespace-normal text-center">DESKTOP</span>
              </TabsTrigger>
              <TabsTrigger value="mobile-games" className={tabStyles.trigger} onClick={withClickSound()}>
                <Smartphone className="h-4 w-4 mb-1 mx-auto" />
                <span className="text-xs sm:text-sm whitespace-normal text-center">MOBILE</span>
              </TabsTrigger>
              <TabsTrigger value="develop" className={tabStyles.trigger} onClick={withClickSound()}>
                <Code className="h-4 w-4 mb-1 mx-auto" />
                <span className="text-xs sm:text-sm whitespace-normal text-center">DEVELOP</span>
              </TabsTrigger>
            </TabsList>
          )}
        </div>

        <TabsContent
          value="exchange"
          className={cn("mt-0 h-full min-h-[500px] pt-4", isCyberpunk && "rounded-lg py-4 px-0")}
          style={
            isCyberpunk
              ? {
                  color: "rgb(224, 255, 255) !important",
                }
              : {}
          }
        >
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

        <TabsContent
          value="desktop-games"
          className={cn("mt-0 h-full min-h-[500px] pt-4", isCyberpunk && "rounded-lg py-4 px-0")}
          style={
            isCyberpunk
              ? {
                  color: "rgb(224, 255, 255) !important",
                }
              : {}
          }
        >
          {selectedGame ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <SoundButton
                  variant="outline"
                  className={cn(
                    "border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all dark:border-gray-700 dark:text-white dark:hover:bg-[#D4AF37] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]",
                    isCyberpunk && "border-cyan-500 text-cyan-400 bg-black/50 hover:bg-cyan-900/50 shadow-cyan-500/30",
                  )}
                  onClick={handleBackToSelection}
                >
                  Back to Game Selection
                </SoundButton>
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-auto bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono dark:bg-[#D4AF37] dark:border-gray-700 dark:text-black",
                    isCyberpunk && "bg-black/70 border-cyan-500 text-cyan-400",
                  )}
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
                <Card className={cn("arcade-card", isCyberpunk && "bg-black/80 border-cyan-500/50")}>
                  <CardContent className="p-12 flex flex-col items-center justify-center">
                    <Gamepad2
                      size={64}
                      className={cn("mb-4 text-gray-700 dark:text-gray-400", isCyberpunk && "text-cyan-500")}
                    />
                    <h2
                      className={cn(
                        "text-3xl font-bold font-mono text-center mb-2 dark:text-white",
                        isCyberpunk && "text-cyan-400",
                      )}
                    >
                      COMING SOON
                    </h2>
                    <p
                      className={cn(
                        "text-center text-gray-700 max-w-md dark:text-gray-300",
                        isCyberpunk && "text-cyan-300/70",
                      )}
                    >
                      This game is currently in development and will be available soon!
                    </p>
                    <SoundButton
                      onClick={handleBackToSelection}
                      className={cn(
                        "mt-8 bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono dark:bg-[#D4AF37] dark:hover:bg-[#C4A137] dark:border-gray-700 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] dark:text-black",
                        isCyberpunk &&
                          "bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-400 border-cyan-500 shadow-cyan-500/30",
                      )}
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

        <TabsContent
          value="mobile-games"
          className={cn("mt-0 h-full min-h-[500px] pt-4", isCyberpunk && "rounded-lg py-4 px-0")}
          style={
            isCyberpunk
              ? {
                  color: "rgb(224, 255, 255) !important",
                }
              : {}
          }
          data-tab="mobile-games"
        >
          <Card
            className={cn("arcade-card", isCyberpunk && "!bg-black/80 !border-cyan-500/50")}
            style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className={cn("h-5 w-5 dark:text-gray-300", isCyberpunk && "text-cyan-400")} />
                  <CardTitle className={cn("font-mono dark:text-white", isCyberpunk && "text-cyan-400")}>
                    MOBILE GAMES
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono dark:bg-[#D4AF37] dark:border-gray-700 dark:text-black",
                    isCyberpunk && "bg-black/70 border-cyan-500 text-cyan-400",
                  )}
                >
                  <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
                  {mutbBalance.toFixed(2)} MUTB
                </Badge>
              </div>
              <CardDescription className={cn("dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                Play games optimized for mobile devices
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className={cn(
                  "p-8 border-2 border-black rounded-lg bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600 text-center",
                  isCyberpunk && "!bg-black/50 !border-cyan-500/50",
                )}
                style={
                  isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}
                }
              >
                <div className="flex justify-center mb-6">
                  <Smartphone
                    size={64}
                    className={cn("text-gray-700 dark:text-gray-300", isCyberpunk && "text-cyan-500")}
                  />
                </div>
                <h3 className={cn("text-2xl font-bold font-mono mb-4 dark:text-white", isCyberpunk && "text-cyan-400")}>
                  Mobile Gaming Coming Soon!
                </h3>
                <p className={cn("text-lg mb-6 dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                  We're working on bringing the Mutable gaming experience to your mobile devices. Stay tuned for
                  exciting mobile-optimized games with the same play-to-earn mechanics!
                </p>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 bg-[#FFD54F] px-4 py-2 rounded-md border-2 border-black dark:bg-[#D4AF37] dark:border-gray-700",
                    isCyberpunk && "bg-cyan-900/50 border-cyan-500 text-cyan-400",
                  )}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">Mobile beta launching Q3 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="develop"
          className={cn("mt-0 h-full min-h-[500px] pt-4", isCyberpunk && "rounded-lg py-4 px-0")}
          style={
            isCyberpunk
              ? {
                  color: "rgb(224, 255, 255) !important",
                }
              : {}
          }
          data-tab="develop"
        >
          <Card
            className={cn("arcade-card", isCyberpunk && "!bg-black/80 !border-cyan-500/50")}
            style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className={cn("h-5 w-5 dark:text-gray-300", isCyberpunk && "text-cyan-400")} />
                  <CardTitle className={cn("font-mono dark:text-white", isCyberpunk && "text-cyan-400")}>
                    GAME DEVELOPERS
                  </CardTitle>
                </div>
              </div>
              <CardDescription className={cn("dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                Build games for the Mutable platform and earn revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div
                    className={cn(
                      "p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600",
                      isCyberpunk && "!bg-black/50 !border-cyan-500/50",
                    )}
                    style={
                      isCyberpunk
                        ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" }
                        : {}
                    }
                  >
                    <h3
                      className={cn("font-bold mb-2 font-mono text-lg dark:text-white", isCyberpunk && "text-cyan-400")}
                    >
                      WHY DEVELOP FOR MUTABLE?
                    </h3>
                    <ul className={cn("space-y-2 text-sm dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-green-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Revenue sharing from in-game transactions and token swaps</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-green-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Access to our growing player base and marketing support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-green-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Integration with Solana blockchain and MUTB token ecosystem</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-green-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Technical support for blockchain integration and game development</span>
                      </li>
                    </ul>
                  </div>

                  <div
                    className={cn(
                      "p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600",
                      isCyberpunk && "!bg-black/50 !border-cyan-500/50",
                    )}
                    style={
                      isCyberpunk
                        ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" }
                        : {}
                    }
                  >
                    <h3
                      className={cn("font-bold mb-2 font-mono text-lg dark:text-white", isCyberpunk && "text-cyan-400")}
                    >
                      REQUIREMENTS
                    </h3>
                    <ul className={cn("space-y-2 text-sm dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      <li className="flex items-start gap-2">
                        <AlertCircle
                          className={cn("h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-pink-500")}
                        />
                        <span>Games must be compatible with our platform's architecture</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle
                          className={cn("h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-pink-500")}
                        />
                        <span>Integration with MUTB token for in-game transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle
                          className={cn("h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-pink-500")}
                        />
                        <span>Adherence to our content guidelines and quality standards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle
                          className={cn("h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-pink-500")}
                        />
                        <span>Regular updates and maintenance of your game</span>
                      </li>
                    </ul>
                  </div>

                  <div
                    className={cn(
                      "p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600",
                      isCyberpunk && "!bg-black/50 !border-cyan-500/50",
                    )}
                    style={
                      isCyberpunk
                        ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" }
                        : {}
                    }
                  >
                    <h3
                      className={cn("font-bold mb-2 font-mono text-lg dark:text-white", isCyberpunk && "text-cyan-400")}
                    >
                      DEVELOPMENT RESOURCES
                    </h3>
                    <p className={cn("text-sm mb-4 dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      We provide resources to help you develop games for our platform:
                    </p>
                    <ul className={cn("space-y-2 text-sm dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-green-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>API documentation for platform integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-green-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>SDK for Solana and MUTB token integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-green-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Design guidelines for the retro arcade aesthetic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-green-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Technical support during development</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className={cn(
                      "p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600",
                      isCyberpunk && "!bg-black/50 !border-cyan-500/50",
                    )}
                    style={
                      isCyberpunk
                        ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" }
                        : {}
                    }
                  >
                    <h3
                      className={cn("font-bold mb-2 font-mono text-lg dark:text-white", isCyberpunk && "text-cyan-400")}
                    >
                      CONTACT US
                    </h3>
                    <p className={cn("text-sm mb-4 dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      Interested in developing games for the Mutable platform? We'd love to hear from you! Contact us
                      directly to discuss your game ideas, get technical support, or learn more about our developer
                      program.
                    </p>

                    <div
                      className={cn(
                        "bg-white dark:bg-gray-800 p-4 rounded-md border-2 border-black dark:border-gray-600 mb-4",
                        isCyberpunk && "bg-black/70 border-cyan-500/70",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className={cn("h-5 w-5 text-blue-600", isCyberpunk && "text-cyan-500")} />
                        <span className={cn("font-mono font-bold dark:text-white", isCyberpunk && "text-cyan-400")}>
                          Email Us
                        </span>
                      </div>
                      <p className={cn("text-sm mb-3 dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                        Send us your game concept, portfolio, or questions:
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md",
                          isCyberpunk && "bg-black/50 border border-cyan-500/30",
                        )}
                      >
                        <Mail className={cn("h-4 w-4 text-blue-600", isCyberpunk && "text-cyan-500")} />
                        <span className={cn("font-mono text-sm dark:text-gray-300", isCyberpunk && "text-cyan-300")}>
                          mutablepvp@gmail.com
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className={cn("text-sm dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                        <span className="font-bold">What to include in your email:</span>
                      </p>
                      <ul
                        className={cn(
                          "text-sm list-disc pl-5 dark:text-gray-300 space-y-1",
                          isCyberpunk && "text-cyan-300/70",
                        )}
                      >
                        <li>Brief description of your game concept</li>
                        <li>Your development experience or portfolio</li>
                        <li>Technical questions or requirements</li>
                        <li>Timeline for development</li>
                      </ul>
                    </div>

                    <SoundButton
                      onClick={handleDeveloperContact}
                      className={cn(
                        "w-full mt-4 bg-[#4CAF50] hover:bg-[#45a049] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono dark:border-gray-700 dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]",
                        isCyberpunk &&
                          "bg-cyan-900/70 hover:bg-cyan-800/70 border-cyan-500 shadow-cyan-500/30 text-cyan-300",
                      )}
                    >
                      <div className="flex items-center justify-center">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>CONTACT US</span>
                      </div>
                    </SoundButton>
                  </div>

                  <div
                    className={cn(
                      "p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600",
                      isCyberpunk && "!bg-black/50 !border-cyan-500/50",
                    )}
                    style={
                      isCyberpunk
                        ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" }
                        : {}
                    }
                  >
                    <h3
                      className={cn("font-bold mb-2 font-mono text-lg dark:text-white", isCyberpunk && "text-cyan-400")}
                    >
                      UPCOMING FEATURES
                    </h3>
                    <p className={cn("text-sm mb-4 dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      We're expanding our platform with these upcoming features:
                    </p>
                    <ul className={cn("space-y-2 text-sm dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Developer dashboard for analytics and revenue tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Cross-game asset marketplace for NFTs and in-game items</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Tournament and leaderboard infrastructure</span>
                      </li>
                    </ul>
                  </div>

                  <div
                    className={cn(
                      "p-4 border-2 border-black rounded-md bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600",
                      isCyberpunk && "!bg-black/50 !border-cyan-500/50",
                    )}
                    style={
                      isCyberpunk
                        ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" }
                        : {}
                    }
                  >
                    <h3
                      className={cn("font-bold mb-2 font-mono text-lg dark:text-white", isCyberpunk && "text-cyan-400")}
                    >
                      TECHNOLOGY STACK
                    </h3>
                    <p className={cn("text-sm mb-4 dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      The Mutable platform is built using modern web technologies:
                    </p>
                    <ul className={cn("space-y-2 text-sm dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Node.js backend for high-performance game servers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>React frontend for responsive and interactive UI</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>Solana blockchain integration for secure transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle
                          className={cn("h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0", isCyberpunk && "text-cyan-500")}
                        />
                        <span>WebSocket for real-time multiplayer functionality</span>
                      </li>
                    </ul>
                    <p className={cn("text-sm mt-4 dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                      Developers can use our SDK and APIs to integrate with our Node.js and React-based platform.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className={cn("text-sm text-center w-full dark:text-gray-300", isCyberpunk && "text-cyan-300/70")}>
                <p>Join our growing ecosystem of game developers and earn revenue through the Mutable platform!</p>
                <p
                  className={cn(
                    "mt-1 text-xs text-muted-foreground dark:text-gray-400",
                    isCyberpunk && "text-cyan-400/50",
                  )}
                >
                  All games are reviewed for quality and compliance before being added to the platform.
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
