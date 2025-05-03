"use client"

import { useState } from "react"
import { gameRegistry } from "@/types/game-registry"
import { useToast } from "@/hooks/use-toast"
import GameErrorBoundary from "@/components/game-error-boundary"

interface GameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner: string | null) => void
}

export function GameContainer({ gameId, playerId, playerName, isHost, gameMode, onGameEnd }: GameContainerProps) {
  const [gameState, setGameState] = useState<"playing" | "ended">("playing")
  const { toast } = useToast()

  const game = gameRegistry.getGame(gameId)

  if (!game) {
    return <div className="text-center p-8">Game not found</div>
  }

  const GameComponent = game.GameComponent

  const handleError = (error: Error) => {
    console.error("Game error:", error)
    toast({
      title: "Game Error",
      description: error.message,
      variant: "destructive",
    })
  }

  // Initialize game state
  const initialGameState = game.initializeGameState({
    playerId,
    playerName,
    isHost,
    gameMode,
    players: [
      { id: playerId, name: playerName, isHost },
      // Mock players for testing
      { id: "ai-1", name: "AI Player 1", isHost: false },
      { id: "ai-2", name: "AI Player 2", isHost: false },
      { id: "ai-3", name: "AI Player 3", isHost: false },
    ],
  })

  return (
    <div className="relative w-full h-full">
      <GameErrorBoundary>
        <GameComponent
          playerId={playerId}
          playerName={playerName}
          isHost={isHost}
          gameMode={gameMode}
          initialGameState={initialGameState}
          onGameEnd={onGameEnd}
          onError={handleError}
        />
      </GameErrorBoundary>
    </div>
  )
}
