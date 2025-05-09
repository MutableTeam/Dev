"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skull, Clock, Trophy, Coins } from "lucide-react"
import Image from "next/image"
import SoundButton from "@/components/sound-button"
import { lastStandConfig } from "./config"
import LastStandInstructions from "./instructions"
import { withClickSound } from "@/utils/sound-utils"
import { useToast } from "@/hooks/use-toast"
import { GameContainer } from "@/components/game-container"
import GamePopOutContainer from "@/components/game-pop-out-container"
import { cn } from "@/lib/utils"

interface LastStandGameLauncherProps {
  publicKey: string
  playerName: string
  mutbBalance: number
  onExit: () => void
  isCyberpunk?: boolean
}

export default function LastStandGameLauncher({
  publicKey,
  playerName,
  mutbBalance,
  onExit,
  isCyberpunk,
}: LastStandGameLauncherProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isGamePopOutOpen, setIsGamePopOutOpen] = useState(false)
  const { toast } = useToast()

  const handleModeSelect = (modeId: string) => {
    const mode = lastStandConfig.modes.find((m) => m.id === modeId)
    if (!mode) return

    if (mode.entryFee > mutbBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${mode.entryFee} MUTB to enter this mode.`,
        variant: "destructive",
      })
      return
    }

    setSelectedMode(modeId)
  }

  const handleGameOver = (stats: any) => {
    // Here you would submit the score to the leaderboard
    toast({
      title: "Game Over!",
      description: `Your final score: ${stats.score}`,
    })

    // Close the pop-out
    setIsGamePopOutOpen(false)

    // Reset game state
    setGameStarted(false)
    setSelectedMode(null)
  }

  const handleStartGame = () => {
    setGameStarted(true)
    setIsGamePopOutOpen(true)
  }

  const handleClosePopOut = () => {
    // Show a confirmation dialog before closing the game
    if (window.confirm("Are you sure you want to exit the game? Your progress will be lost.")) {
      setIsGamePopOutOpen(false)
      setGameStarted(false)
    }
  }

  // Game content to be rendered in the pop-out
  const renderGameContent = () => {
    if (!selectedMode) return null

    return (
      <div className="w-full h-full">
        <GameContainer
          gameId="archer-arena"
          playerId={publicKey}
          playerName={playerName}
          isHost={true}
          gameMode={selectedMode}
          onGameEnd={handleGameOver}
        />
      </div>
    )
  }

  if (gameStarted && selectedMode) {
    return (
      <>
        <GamePopOutContainer isOpen={isGamePopOutOpen} onClose={handleClosePopOut} title="ARCHER ARENA: LAST STAND">
          {renderGameContent()}
        </GamePopOutContainer>

        {!isGamePopOutOpen && (
          <Card
            className={cn(
              "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              isCyberpunk && "!bg-black/80 !border-cyan-500/50",
            )}
            style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
            data-game="last-stand"
          >
            <CardHeader>
              <CardTitle className="text-center font-mono">GAME PAUSED</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-xl font-bold font-mono">Your game is currently paused</div>
            </CardContent>
            <CardFooter>
              <SoundButton
                className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                onClick={() => setIsGamePopOutOpen(true)}
              >
                RESUME GAME
              </SoundButton>
            </CardFooter>
          </Card>
        )}
      </>
    )
  }

  if (selectedMode && !gameStarted) {
    const mode = lastStandConfig.modes.find((m) => m.id === selectedMode)!

    return (
      <Card
        className={cn(
          "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          isCyberpunk && "!bg-black/80 !border-cyan-500/50",
        )}
        style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
        data-game="last-stand"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skull className="h-5 w-5" />
              <CardTitle className="font-mono">ARCHER ARENA: LAST STAND</CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
            >
              <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
              {mutbBalance.toFixed(2)} MUTB
            </Badge>
          </div>
          <CardDescription>Confirm your entry to {mode.name}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div
            className={cn(
              "p-4 border-2 border-black rounded-md bg-[#f5efdc]",
              isCyberpunk && "!bg-black/50 !border-cyan-500/50",
            )}
            style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.5)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5" />
              <div className="font-bold">{mode.name}</div>
            </div>
            <p>{mode.description}</p>

            {mode.entryFee > 0 && (
              <div className="mt-4 p-3 bg-[#FFD54F] rounded-md border border-black">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  <div className="font-medium">Entry Fee:</div>
                  <div className="flex items-center">
                    <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} />
                    <span className="ml-1">{mode.entryFee} MUTB</span>
                  </div>
                </div>
              </div>
            )}

            {mode.duration > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Duration:{" "}
                  {mode.duration / (60 * 60 * 1000) >= 1
                    ? `${mode.duration / (60 * 60 * 1000)} hours`
                    : `${mode.duration / (60 * 1000)} minutes`}
                </span>
              </div>
            )}
          </div>

          <LastStandInstructions />
        </CardContent>

        <CardFooter className="flex justify-between">
          <SoundButton
            variant="outline"
            className="border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            onClick={() => setSelectedMode(null)}
          >
            Back
          </SoundButton>

          <SoundButton
            className="bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            onClick={handleStartGame}
          >
            {mode.entryFee > 0 ? `PAY ${mode.entryFee} MUTB & START` : "START GAME"}
          </SoundButton>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        isCyberpunk && "!bg-black/80 !border-cyan-500/50",
      )}
      style={isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}}
      data-game="last-stand"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className="h-5 w-5" />
            <CardTitle className="font-mono">ARCHER ARENA: LAST STAND</CardTitle>
          </div>
          <Badge
            variant="outline"
            className="bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
          >
            <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
            {mutbBalance.toFixed(2)} MUTB
          </Badge>
        </div>
        <CardDescription>Select a game mode to begin</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lastStandConfig.modes.map((mode) => (
            <Card
              key={mode.id}
              className={cn(
                "border-2 border-black overflow-hidden cursor-pointer hover:bg-[#f5efdc] transition-colors flex flex-col",
                isCyberpunk && "!bg-black/80 !border-cyan-500/50",
              )}
              style={
                isCyberpunk ? { backgroundColor: "rgba(0, 0, 0, 0.8)", borderColor: "rgba(6, 182, 212, 0.5)" } : {}
              }
              onClick={withClickSound(() => handleModeSelect(mode.id))}
            >
              <CardHeader className="p-3">
                <div className="flex items-center gap-2">
                  {mode.id === "practice" ? (
                    <div className="bg-[#FFD54F] p-1 rounded-md border border-black">🎯</div>
                  ) : mode.id === "hourly" ? (
                    <div className="bg-[#FFD54F] p-1 rounded-md border border-black">⏱️</div>
                  ) : (
                    <div className="bg-[#FFD54F] p-1 rounded-md border border-black">🏆</div>
                  )}
                  <CardTitle className="text-base font-mono">{mode.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-3 pt-0 flex-grow">
                <p className="text-sm text-muted-foreground">{mode.description}</p>

                <div className="mt-2 text-xs flex items-center gap-1">
                  <span className="font-medium">Entry Fee:</span>
                  <div className="flex items-center">
                    <Image src="/images/mutable-token.png" alt="MUTB" width={12} height={12} />
                    <span>{mode.entryFee} MUTB</span>
                  </div>
                </div>

                {mode.duration > 0 && (
                  <div className="mt-1 text-xs flex items-center gap-1">
                    <span className="font-medium">Duration:</span>
                    <span>
                      {mode.duration / (60 * 60 * 1000) >= 1
                        ? `${mode.duration / (60 * 60 * 1000)} hours`
                        : `${mode.duration / (60 * 1000)} minutes`}
                    </span>
                  </div>
                )}

                {mode.leaderboardRefresh && (
                  <div className="mt-1 text-xs flex items-center gap-1">
                    <span className="font-medium">Leaderboard:</span>
                    <span>{mode.leaderboardRefresh}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-3 mt-auto">
                <SoundButton
                  className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                  onClick={() => handleModeSelect(mode.id)}
                  disabled={mode.entryFee > mutbBalance}
                >
                  {mode.entryFee > mutbBalance ? "INSUFFICIENT FUNDS" : "SELECT"}
                </SoundButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <SoundButton
          variant="outline"
          className="w-full border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
          onClick={onExit}
        >
          BACK TO GAME SELECTION
        </SoundButton>
      </CardFooter>
    </Card>
  )
}
