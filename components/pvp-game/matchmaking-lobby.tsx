"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Users, Trophy, Clock, BombIcon as BilliardBall, Crosshair } from "lucide-react"
import Image from "next/image"
import GameController from "./game-controller"
import GameInstructions from "./game-instructions"
import WaitingRoom from "./waiting-room"
import { loadAudioFiles } from "@/utils/audio-manager"
import SoundButton from "../sound-button"
import { withClickSound } from "@/utils/sound-utils"
// Add import for GameErrorBoundary at the top of the file
import GameErrorBoundary from "@/components/game-error-boundary"
import { debugManager } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"

interface MatchmakingLobbyProps {
  publicKey: string
  playerName: string
  mutbBalance: number
  onExit: () => void
  selectedGame?: string
}

interface GameMode {
  id: string
  name: string
  description: string
  players: number
  icon: React.ReactNode
  minWager: number
}

interface GameLobby {
  id: string
  host: string
  hostName: string
  mode: string
  modeName: string
  wager: number
  players: number
  maxPlayers: number
  status: "waiting" | "full" | "in-progress"
  gameType: "shooter" | "pool"
}

// Add this after the component declaration
const gameTypeMap: Record<string, "shooter" | "pool"> = {
  "top-down-shooter": "shooter",
  "mutball-pool": "pool",
}

export default function MatchmakingLobby({
  publicKey,
  playerName,
  mutbBalance,
  onExit,
  selectedGame = "top-down-shooter",
}: MatchmakingLobbyProps) {
  const [activeTab, setActiveTab] = useState("browse")
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [selectedGameType, setSelectedGameType] = useState<"shooter" | "pool">(gameTypeMap[selectedGame] || "shooter")
  const [wagerAmount, setWagerAmount] = useState<number>(1)
  const [localPlayerName, setLocalPlayerName] = useState(playerName)

  // Game state management
  const [gameState, setGameState] = useState<"lobby" | "waiting" | "playing" | "results">("lobby")
  const [selectedLobby, setSelectedLobby] = useState<GameLobby | null>(null)
  const [gameResult, setGameResult] = useState<{ winner: string | null; reward: number } | null>(null)

  // Refs for cleanup tracking
  const componentIdRef = useRef<string>(`matchmaking-${Date.now()}`)
  const lobbyUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const newLobbyIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Track component mount
  useEffect(() => {
    debugManager.trackComponentMount("MatchmakingLobby", { publicKey, selectedGame })
    transitionDebugger.trackTransition("none", "mounted", "MatchmakingLobby")

    return () => {
      debugManager.trackComponentUnmount("MatchmakingLobby")
      transitionDebugger.trackTransition("mounted", "unmounted", "MatchmakingLobby")

      // Clean up all resources
      transitionDebugger.cleanupAll("MatchmakingLobby")
    }
  }, [publicKey, selectedGame])

  // Game modes
  const shooterModes: GameMode[] = [
    {
      id: "duel",
      name: "1v1 Duel",
      description: "Face off against a single opponent in a 2-minute battle to the death",
      players: 2,
      icon: <Trophy className="h-6 w-6" />,
      minWager: 1,
    },
    {
      id: "ffa",
      name: "Free-For-All",
      description: "Every player for themselves in a 2-minute chaotic battle royale",
      players: 4,
      icon: <Users className="h-6 w-6" />,
      minWager: 2,
    },
    {
      id: "timed",
      name: "Timed Match",
      description: "Score as many kills as possible within 2 minutes",
      players: 4,
      icon: <Clock className="h-6 w-6" />,
      minWager: 2,
    },
  ]

  // Pool game modes
  const poolModes: GameMode[] = [
    {
      id: "eight-ball",
      name: "8-Ball",
      description: "Classic 8-ball pool. Sink your balls (solids or stripes) and then the 8-ball to win",
      players: 2,
      icon: <BilliardBall className="h-6 w-6" />,
      minWager: 3,
    },
    {
      id: "nine-ball",
      name: "9-Ball",
      description: "Hit the lowest numbered ball first and sink the 9-ball to win",
      players: 2,
      icon: <BilliardBall className="h-6 w-6" />,
      minWager: 5,
    },
  ]

  // Get the appropriate game modes based on selected game type
  const gameModes = selectedGameType === "shooter" ? shooterModes : poolModes

  // Mock lobbies with a more realistic structure
  const [lobbies, setLobbies] = useState<GameLobby[]>([
    {
      id: "lobby-1",
      host: "Player1",
      hostName: "CryptoGamer",
      mode: "duel",
      modeName: "1v1 Duel",
      wager: 5,
      players: 1,
      maxPlayers: 2,
      status: "waiting",
      gameType: "shooter",
    },
    {
      id: "lobby-2",
      host: "Player2",
      hostName: "SolanaWarrior",
      mode: "ffa",
      modeName: "Free-For-All",
      wager: 10,
      players: 2,
      maxPlayers: 4,
      status: "waiting",
      gameType: "shooter",
    },
    {
      id: "lobby-3",
      host: "Player3",
      hostName: "MUTBChampion",
      mode: "timed",
      modeName: "Timed Match",
      wager: 20,
      players: 3,
      maxPlayers: 4,
      status: "waiting",
      gameType: "shooter",
    },
    {
      id: "lobby-4",
      host: "Player4",
      hostName: "TokenShooter",
      mode: "duel",
      modeName: "1v1 Duel",
      wager: 50,
      players: 2,
      maxPlayers: 2,
      status: "full",
      gameType: "shooter",
    },
    {
      id: "lobby-5",
      host: "Player5",
      hostName: "PoolShark",
      mode: "eight-ball",
      modeName: "8-Ball",
      wager: 15,
      players: 1,
      maxPlayers: 2,
      status: "waiting",
      gameType: "pool",
    },
    {
      id: "lobby-6",
      host: "Player6",
      hostName: "BilliardsMaster",
      mode: "nine-ball",
      modeName: "9-Ball",
      wager: 25,
      players: 1,
      maxPlayers: 2,
      status: "waiting",
      gameType: "pool",
    },
  ])

  // Simulate lobby updates with safe intervals
  useEffect(() => {
    // Clear any existing interval first
    if (lobbyUpdateIntervalRef.current) {
      transitionDebugger.safeClearInterval(`${componentIdRef.current}-lobby-update`)
      lobbyUpdateIntervalRef.current = null
    }

    // Only run this effect when in lobby state
    if (gameState !== "lobby") return

    debugManager.logInfo("MatchmakingLobby", "Setting up lobby update interval")

    lobbyUpdateIntervalRef.current = transitionDebugger.safeSetInterval(
      () => {
        setLobbies((prevLobbies) => {
          return prevLobbies.map((lobby) => {
            // Randomly update player counts for waiting lobbies
            if (lobby.status === "waiting" && Math.random() > 0.7) {
              const newPlayerCount = Math.min(lobby.players + 1, lobby.maxPlayers)
              const newStatus = newPlayerCount === lobby.maxPlayers ? "full" : "waiting"
              return { ...lobby, players: newPlayerCount, status: newStatus }
            }
            // Randomly start full games
            else if (lobby.status === "full" && Math.random() > 0.8) {
              return { ...lobby, status: "in-progress" }
            }
            // Randomly finish in-progress games
            else if (lobby.status === "in-progress" && Math.random() > 0.9) {
              return {
                ...lobby,
                status: "waiting",
                players: 1,
              }
            }
            return lobby
          })
        })
      },
      5000,
      `${componentIdRef.current}-lobby-update`,
    )

    return () => {
      if (lobbyUpdateIntervalRef.current) {
        transitionDebugger.safeClearInterval(`${componentIdRef.current}-lobby-update`)
        lobbyUpdateIntervalRef.current = null
        debugManager.logInfo("MatchmakingLobby", "Cleared lobby update interval")
      }
    }
  }, [gameState])

  // Simulate new lobbies being created with safe intervals
  useEffect(() => {
    // Clear any existing interval first
    if (newLobbyIntervalRef.current) {
      transitionDebugger.safeClearInterval(`${componentIdRef.current}-new-lobby`)
      newLobbyIntervalRef.current = null
    }

    // Only run this effect when in lobby state
    if (gameState !== "lobby") return

    debugManager.logInfo("MatchmakingLobby", "Setting up new lobby interval")

    newLobbyIntervalRef.current = transitionDebugger.safeSetInterval(
      () => {
        if (Math.random() > 0.8) {
          const gameType = Math.random() > 0.7 ? "pool" : "shooter"
          const modes = gameType === "shooter" ? shooterModes : poolModes
          const randomMode = modes[Math.floor(Math.random() * modes.length)]
          const botNames = ["CryptoArcher", "TokenShooter", "BlockchainGamer", "NFTWarrior", "SolanaSniper"]
          const randomName = botNames[Math.floor(Math.random() * botNames.length)]

          const newLobby: GameLobby = {
            id: `lobby-${Date.now()}`,
            host: `bot-${Date.now()}`,
            hostName: randomName,
            mode: randomMode.id,
            modeName: randomMode.name,
            wager: Math.floor(Math.random() * 20) + 1,
            players: 1,
            maxPlayers: randomMode.players,
            status: "waiting",
            gameType,
          }

          setLobbies((prev) => [...prev.slice(-9), newLobby]) // Keep last 10 lobbies
        }
      },
      10000,
      `${componentIdRef.current}-new-lobby`,
    )

    return () => {
      if (newLobbyIntervalRef.current) {
        transitionDebugger.safeClearInterval(`${componentIdRef.current}-new-lobby`)
        newLobbyIntervalRef.current = null
        debugManager.logInfo("MatchmakingLobby", "Cleared new lobby interval")
      }
    }
  }, [gameState, shooterModes, poolModes])

  const createLobby = () => {
    if (!selectedMode) return
    if (selectedGameType === "pool") {
      alert("Pool games are coming soon!")
      return
    }

    const mode = gameModes.find((m) => m.id === selectedMode)
    if (!mode) return

    if (wagerAmount < mode.minWager) {
      alert(`Minimum wager for ${mode.name} is ${mode.minWager} MUTB`)
      return
    }

    if (wagerAmount > mutbBalance) {
      alert("You don't have enough MUTB tokens for this wager")
      return
    }

    // Try to load audio files, but don't block game creation if it fails
    loadAudioFiles().catch((err) => {
      debugManager.logWarning("AUDIO", "Audio files could not be loaded, game will continue without sound", err)
    })

    const newLobby: GameLobby = {
      id: `lobby-${Date.now()}`,
      host: publicKey,
      hostName: localPlayerName,
      mode: selectedMode,
      modeName: mode.name,
      wager: wagerAmount,
      players: 1,
      maxPlayers: mode.players,
      status: "waiting",
      gameType: selectedGameType,
    }

    setLobbies([...lobbies, newLobby])
    setSelectedLobby(newLobby)

    // Track state transition
    transitionDebugger.trackTransition("lobby", "waiting", "MatchmakingLobby", { lobbyId: newLobby.id })
    setGameState("waiting")

    debugManager.logInfo("MatchmakingLobby", "Created new lobby", newLobby)
  }

  const joinLobby = (lobby: GameLobby) => {
    if (lobby.status !== "waiting") return
    if (lobby.wager > mutbBalance) {
      alert("You don't have enough MUTB tokens for this wager")
      return
    }
    if (lobby.gameType === "pool") {
      alert("Pool games are coming soon!")
      return
    }

    // Try to load audio files, but don't block game joining if it fails
    loadAudioFiles().catch((err) => {
      debugManager.logWarning("AUDIO", "Audio files could not be loaded, game will continue without sound", err)
    })

    // Update the lobby to add the player
    setLobbies((prevLobbies) =>
      prevLobbies.map((l) => {
        if (l.id === lobby.id) {
          const newPlayerCount = l.players + 1
          const newStatus = newPlayerCount === l.maxPlayers ? "full" : "waiting"
          return { ...l, players: newPlayerCount, status: newStatus }
        }
        return l
      }),
    )

    // In a real app, this would send a request to join the lobby
    setSelectedLobby(lobby)

    // Track state transition
    transitionDebugger.trackTransition("lobby", "waiting", "MatchmakingLobby", { lobbyId: lobby.id })
    setGameState("waiting")

    debugManager.logInfo("MatchmakingLobby", "Joined lobby", lobby)
  }

  const handleGameEnd = (winner: string | null) => {
    if (!selectedLobby) return

    // Calculate rewards
    const totalPot = selectedLobby.wager * selectedLobby.maxPlayers
    const winnerReward = totalPot * 0.95 // 5% platform fee

    setGameResult({
      winner,
      reward: winner === publicKey ? winnerReward : 0,
    })

    // Track state transition
    transitionDebugger.trackTransition("playing", "results", "MatchmakingLobby", { winner })
    setGameState("results")

    debugManager.logInfo("MatchmakingLobby", "Game ended", { winner, reward: winner === publicKey ? winnerReward : 0 })
  }

  const exitGame = () => {
    // Clean up any game-related resources
    transitionDebugger.cleanupAll("GameController")

    // Reset state
    setGameState("lobby")
    setSelectedLobby(null)
    setGameResult(null)

    // Track state transition
    transitionDebugger.trackTransition("any", "exiting", "MatchmakingLobby")

    // Use a safe timeout to ensure cleanup completes before exiting
    transitionDebugger.safeSetTimeout(
      () => {
        try {
          onExit()
        } catch (error) {
          debugManager.logError("MatchmakingLobby", "Error in onExit callback", error)
        }
      },
      300,
      `${componentIdRef.current}-exit`,
    )

    debugManager.logInfo("MatchmakingLobby", "Exiting game")
  }

  const exitWaitingRoom = () => {
    // Track state transition
    transitionDebugger.trackTransition("waiting", "lobby", "MatchmakingLobby")
    setGameState("lobby")
    setSelectedLobby(null)

    debugManager.logInfo("MatchmakingLobby", "Exited waiting room")
  }

  const startGame = () => {
    // Track state transition
    transitionDebugger.trackTransition("waiting", "playing", "MatchmakingLobby")
    setGameState("playing")

    debugManager.logInfo("MatchmakingLobby", "Starting game")
  }

  // Render based on game state
  if (gameState === "playing") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SoundButton
            variant="outline"
            className="border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            onClick={exitGame}
          >
            Exit Game
          </SoundButton>
          <div className="flex items-center gap-2">
            <GameInstructions />
            <Badge variant="outline" className="bg-[#FFD54F] text-black border-2 border-black font-mono">
              WAGER: {selectedLobby?.wager} MUTB
            </Badge>
          </div>
        </div>

        <GameErrorBoundary>
          <GameController
            playerId={publicKey}
            playerName={localPlayerName}
            isHost={selectedLobby?.host === publicKey}
            onGameEnd={handleGameEnd}
          />
        </GameErrorBoundary>
      </div>
    )
  }

  if (gameState === "results") {
    return (
      <Card className="bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-center font-mono">GAME OVER</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {gameResult?.winner === publicKey ? (
            <>
              <div className="text-4xl font-bold font-mono text-green-600">YOU WIN!</div>
              <div className="flex items-center justify-center gap-2 text-2xl">
                <Image src="/images/mutable-token.png" alt="MUTB" width={32} height={32} />
                <span className="font-mono">+{gameResult.reward} MUTB</span>
              </div>
            </>
          ) : (
            <div className="text-4xl font-bold font-mono text-red-600">YOU LOSE!</div>
          )}
        </CardContent>
        <CardFooter>
          <SoundButton
            className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            onClick={exitGame}
          >
            RETURN TO LOBBY
          </SoundButton>
        </CardFooter>
      </Card>
    )
  }

  if (gameState === "waiting" && selectedLobby) {
    return (
      <WaitingRoom
        lobbyId={selectedLobby.id}
        hostId={selectedLobby.host}
        hostName={selectedLobby.hostName}
        publicKey={publicKey}
        playerName={localPlayerName}
        maxPlayers={selectedLobby.maxPlayers}
        wager={selectedLobby.wager}
        gameMode={selectedLobby.modeName}
        onExit={exitWaitingRoom}
        onGameStart={startGame}
      />
    )
  }

  // Default: lobby state
  const filteredLobbies = lobbies.filter((lobby) => lobby.gameType === selectedGameType)

  return (
    <Card className="bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            <CardTitle className="font-mono">PVP ARENA</CardTitle>
          </div>
          <Badge
            variant="outline"
            className="bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
          >
            <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
            {mutbBalance.toFixed(2)} MUTB
          </Badge>
        </div>
        <CardDescription>Battle other players and win MUTB tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 border-2 border-black bg-[#FFD54F]">
            <TabsTrigger
              value="browse"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
              onClick={withClickSound()}
            >
              BROWSE GAMES
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-mono"
              onClick={withClickSound()}
            >
              CREATE GAME
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {filteredLobbies.length > 0 ? (
              <div className="space-y-3">
                {filteredLobbies.map((lobby) => {
                  const gameMode =
                    lobby.gameType === "shooter"
                      ? shooterModes.find((m) => m.id === lobby.mode)
                      : poolModes.find((m) => m.id === lobby.mode)

                  return (
                    <div
                      key={lobby.id}
                      className="flex items-center justify-between p-3 border-2 border-black rounded-md bg-[#f5efdc] hover:bg-[#f0e9d2] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-[#FFD54F] p-2 rounded-md border-2 border-black">
                          {lobby.gameType === "pool" ? (
                            <BilliardBall className="h-5 w-5" />
                          ) : (
                            gameMode?.icon || <Gamepad2 className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold font-mono flex items-center gap-2">
                            {gameMode?.name || "Unknown"}
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 font-normal text-xs">
                              {lobby.status === "in-progress" ? "IN PROGRESS" : lobby.players + "/" + lobby.maxPlayers}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">Host: {lobby.hostName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-medium">Wager</div>
                          <div className="font-mono flex items-center justify-center gap-1">
                            <Image src="/images/mutable-token.png" alt="MUTB" width={12} height={12} />
                            <span>{lobby.wager}</span>
                          </div>
                        </div>
                        <SoundButton
                          className="bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                          disabled={lobby.status !== "waiting" || lobby.host === publicKey}
                          onClick={() => joinLobby(lobby)}
                        >
                          {lobby.status === "in-progress"
                            ? "IN PROGRESS"
                            : lobby.status === "full"
                              ? "FULL"
                              : lobby.host === publicKey
                                ? "YOUR GAME"
                                : "JOIN"}
                        </SoundButton>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Gamepad2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="font-mono">NO ACTIVE {selectedGameType.toUpperCase()} GAMES</p>
                <p className="text-sm mt-2">Create a new game to start playing</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="playerName" className="font-mono">
                  YOUR NAME
                </Label>
                <Input
                  id="playerName"
                  value={localPlayerName}
                  onChange={(e) => setLocalPlayerName(e.target.value)}
                  className="border-2 border-black"
                  maxLength={15}
                />
              </div>

              <div>
                <Label className="font-mono">GAME TYPE</Label>
                <div className="p-3 border-2 rounded-md border-black bg-[#FFD54F] mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white p-1 rounded-md border border-black">
                      {selectedGameType === "shooter" ? (
                        <Crosshair className="h-5 w-5" />
                      ) : (
                        <BilliardBall className="h-5 w-5" />
                      )}
                    </div>
                    <div className="font-bold font-mono">
                      {selectedGameType === "shooter" ? "Top-Down Shooter" : "MUTBall Pool"}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedGameType === "shooter"
                      ? "Fast-paced arena shooter with projectiles and dodge mechanics"
                      : "Strategic pool game with power-ups and special abilities"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="font-mono">GAME MODE</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {gameModes.map((mode) => (
                    <div
                      key={mode.id}
                      className={`p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        selectedMode === mode.id
                          ? "border-black bg-[#FFD54F]"
                          : "border-gray-300 bg-[#f5efdc] hover:border-black"
                      }`}
                      onClick={withClickSound(() => setSelectedMode(mode.id))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-white p-1 rounded-md border border-black">{mode.icon}</div>
                        <div className="font-bold font-mono">{mode.name}</div>
                      </div>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Players:</span> {mode.players}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Min Wager:</span> {mode.minWager} MUTB
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="wagerAmount" className="font-mono">
                  WAGER AMOUNT (MUTB)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="wagerAmount"
                    type="number"
                    min={1}
                    max={mutbBalance}
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(Number(e.target.value))}
                    className="border-2 border-black"
                  />
                  <div className="flex items-center gap-1 bg-[#f5efdc] px-3 py-2 rounded-md border-2 border-black">
                    <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} />
                    <span className="font-mono">MUTB</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Your balance: {mutbBalance.toFixed(2)} MUTB</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {activeTab === "create" ? (
          <SoundButton
            className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            disabled={!selectedMode || wagerAmount <= 0 || wagerAmount > mutbBalance}
            onClick={createLobby}
          >
            CREATE GAME
          </SoundButton>
        ) : (
          <SoundButton
            className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            onClick={() => setActiveTab("create")}
          >
            CREATE NEW GAME
          </SoundButton>
        )}
      </CardFooter>
    </Card>
  )
}
