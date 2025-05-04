"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gamepad2, Users, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import SoundButton from "../sound-button"
import CountdownTimer from "./countdown-timer"
import { debugManager } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import Instructions from "@/games/top-down-shooter/instructions"

interface Player {
  id: string
  name: string
  isReady: boolean
}

interface WaitingRoomProps {
  lobbyId: string
  hostId: string
  hostName: string
  publicKey: string
  playerName: string
  maxPlayers: number
  wager: number
  gameMode: string
  onExit: () => void
  onGameStart: () => void
}

export default function WaitingRoom({
  lobbyId,
  hostId,
  hostName,
  publicKey,
  playerName,
  maxPlayers,
  wager,
  gameMode,
  onExit,
  onGameStart,
}: WaitingRoomProps) {
  const [players, setPlayers] = useState<Player[]>([
    // Host is automatically ready
    { id: hostId, name: hostName, isReady: true },
    // If current player is not the host, add them as not ready
    ...(publicKey !== hostId ? [{ id: publicKey, name: playerName, isReady: false }] : []),
  ])
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [isHost] = useState(hostId === publicKey)
  const componentId = useRef(`waiting-room-${lobbyId}`).current
  const gameStartedRef = useRef(false)
  const countdownStartedAtRef = useRef<number | null>(null)

  // Check if all players are ready
  const allPlayersReady = players.length >= 2 && players.every((player) => player.isReady)

  // Track component mount
  useEffect(() => {
    debugManager.trackComponentMount("WaitingRoom", { lobbyId, isHost })
    transitionDebugger.trackTransition("none", "mounted", "WaitingRoom", { lobbyId, isHost })

    // Simulate other players joining
    const joinInterval = transitionDebugger.safeSetInterval(
      () => {
        if (isCountingDown) return // Don't add players during countdown

        setPlayers((currentPlayers) => {
          // Only add players if we're not at max capacity
          if (currentPlayers.length >= maxPlayers) {
            return currentPlayers
          }

          // Check if player already exists with this ID
          const botId = `bot-${Date.now()}`
          if (currentPlayers.some((p) => p.id === botId)) {
            return currentPlayers
          }

          // Generate a random player
          const botNames = ["CryptoArcher", "TokenShooter", "BlockchainGamer", "NFTWarrior", "SolanaSniper"]
          const randomName = botNames[Math.floor(Math.random() * botNames.length)]
          const newPlayer = { id: botId, name: randomName, isReady: false }

          return [...currentPlayers, newPlayer]
        })
      },
      3000,
      `${componentId}-join-interval`,
    )

    // Simulate bots randomly getting ready
    const readyInterval = transitionDebugger.safeSetInterval(
      () => {
        if (isCountingDown) return // Don't change ready status during countdown

        setPlayers((currentPlayers) =>
          currentPlayers.map((player) => {
            // Only update bot players that aren't ready
            if (player.id.startsWith("bot-") && !player.isReady && Math.random() > 0.5) {
              return { ...player, isReady: true }
            }
            return player
          }),
        )
      },
      2000,
      `${componentId}-ready-interval`,
    )

    // Cleanup function
    return () => {
      debugManager.trackComponentUnmount("WaitingRoom")
      transitionDebugger.trackTransition("mounted", "unmounted", "WaitingRoom")

      // Clean up all timers and intervals
      transitionDebugger.safeClearInterval(`${componentId}-join-interval`)
      transitionDebugger.safeClearInterval(`${componentId}-ready-interval`)
      transitionDebugger.safeClearTimeout(`${componentId}-start-countdown`)
      transitionDebugger.safeClearTimeout(`${componentId}-game-start`)

      // Log cleanup
      debugManager.logInfo("WaitingRoom", "Component cleanup completed")
    }
  }, [lobbyId, isHost, maxPlayers, componentId, isCountingDown])

  // Watch for all players ready to automatically start countdown
  useEffect(() => {
    if (allPlayersReady && !isCountingDown && players.length >= 2 && countdownStartedAtRef.current === null) {
      debugManager.logInfo("WaitingRoom", "All players ready, starting countdown")

      // Add a small delay before starting countdown
      transitionDebugger.safeSetTimeout(
        () => {
          setIsCountingDown(true)
          countdownStartedAtRef.current = Date.now()
          debugManager.logInfo("WaitingRoom", "Countdown started at: " + countdownStartedAtRef.current)
        },
        1000,
        `${componentId}-auto-start-countdown`,
      )
    }

    return () => {
      transitionDebugger.safeClearTimeout(`${componentId}-auto-start-countdown`)
    }
  }, [allPlayersReady, isCountingDown, players.length, componentId])

  // Handle game start
  const handleGameStart = () => {
    // Prevent multiple game starts
    if (gameStartedRef.current) {
      debugManager.logWarning("WaitingRoom", "Game start already triggered, ignoring duplicate call")
      return
    }

    gameStartedRef.current = true
    debugManager.logInfo("WaitingRoom", "Game starting from waiting room")
    transitionDebugger.trackTransition("waiting", "starting", "WaitingRoom")

    // Call onGameStart directly to ensure it's called
    try {
      onGameStart()
      debugManager.logInfo("WaitingRoom", "onGameStart callback executed successfully")
    } catch (error) {
      debugManager.logError("WaitingRoom", "Error in onGameStart callback", error)
      // Reset the flag in case we need to try again
      gameStartedRef.current = false
    }
  }

  // Handle exit
  const handleExit = () => {
    debugManager.logInfo("WaitingRoom", "Exiting waiting room")
    transitionDebugger.trackTransition("waiting", "exiting", "WaitingRoom")

    try {
      onExit()
    } catch (error) {
      debugManager.logError("WaitingRoom", "Error in onExit callback", error)
    }
  }

  // Toggle ready status for current player
  const toggleReady = () => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => {
        if (player.id === publicKey) {
          return { ...player, isReady: !player.isReady }
        }
        return player
      }),
    )
  }

  // Memoize the countdown timer to prevent re-renders
  const countdownTimer = isCountingDown ? (
    <div className="text-center space-y-2">
      <div className="font-mono text-lg dark:text-white">GAME STARTING IN</div>
      <CountdownTimer
        key={`countdown-${countdownStartedAtRef.current}`}
        duration={5}
        onComplete={handleGameStart}
        size="large"
        className="py-4"
      />
    </div>
  ) : null

  return (
    <Card className="arcade-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 dark:text-gray-300" />
            <CardTitle className="font-mono dark:text-white">WAITING ROOM</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-[#FFD54F] text-black border-2 border-black font-mono dark:bg-[#D4AF37] dark:border-gray-700 dark:text-black"
            >
              {gameMode}
            </Badge>
            <Instructions variant="icon" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Image src="/images/mutable-token.png" alt="MUTB" width={24} height={24} />
          <span className="font-mono text-xl dark:text-white">{wager} MUTB WAGER</span>
        </div>

        {isCountingDown ? (
          countdownTimer
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 dark:text-gray-300" />
              <span className="font-mono dark:text-white">
                PLAYERS ({players.length}/{maxPlayers})
              </span>
            </div>
            <div
              className={`text-sm ${allPlayersReady ? "text-green-600 font-bold dark:text-green-500" : "text-muted-foreground dark:text-gray-400"}`}
            >
              {allPlayersReady
                ? "All players ready! Game will start soon..."
                : "Waiting for all players to be ready..."}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: maxPlayers }).map((_, index) => {
            const player = players[index]
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-md border-2 ${
                  player
                    ? player.isReady
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-700"
                      : "border-black bg-[#f5efdc] dark:bg-gray-700 dark:border-gray-600"
                    : "border-dashed border-gray-400 bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                }`}
              >
                {player ? (
                  <>
                    <Avatar className="border border-black dark:border-gray-600">
                      <AvatarImage src={`/diverse-group-avatars.png?height=40&width=40&query=avatar ${index + 1}`} />
                      <AvatarFallback className="dark:bg-gray-700 dark:text-white">
                        {player.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-bold font-mono flex items-center gap-2 dark:text-white">
                        {player.name}
                        {player.id === hostId && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-[#FFD54F] text-black text-xs dark:bg-[#D4AF37] dark:border-gray-700"
                          >
                            HOST
                          </Badge>
                        )}
                        {player.id === publicKey && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-gray-200 text-gray-700 text-xs dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                          >
                            YOU
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        {player.isReady ? (
                          <div className="flex items-center text-green-600 dark:text-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ready
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-600 dark:text-amber-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Ready
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      ?
                    </div>
                    <div className="font-mono">Waiting...</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <SoundButton
            variant="outline"
            className="border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all dark:border-gray-700 dark:text-white dark:hover:bg-[#D4AF37] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
            onClick={handleExit}
            disabled={isCountingDown}
          >
            Leave Lobby
          </SoundButton>
          <Instructions variant="full" />
        </div>

        {isHost ? (
          <SoundButton
            className="bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all dark:border-gray-700 dark:text-white dark:hover:bg-[#D4AF37] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
            onClick={handleGameStart}
            disabled={!allPlayersReady || isCountingDown}
          >
            Start Game
          </SoundButton>
        ) : (
          <SoundButton
            variant="outline"
            className={`border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all dark:border-gray-700 dark:text-white dark:hover:bg-[#D4AF37] dark:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] ${
              isCountingDown ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={toggleReady}
            disabled={isCountingDown}
          >
            {players.find((p) => p.id === publicKey)?.isReady ? "Not Ready" : "Ready!"}
          </SoundButton>
        )}
      </CardFooter>
    </Card>
  )
}
