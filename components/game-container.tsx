"use client"

import { useState, useEffect } from "react"
import { gameRegistry } from "@/types/game-registry"
import { useToast } from "@/hooks/use-toast"
import GameErrorBoundary from "@/components/game-error-boundary"
import { debugManager } from "@/utils/debug-utils"

interface GameContainerProps {
  gameId: string
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  onGameEnd: (winner: string | null) => void
}

export function GameContainer({ gameId, playerId, playerName, isHost, gameMode, onGameEnd }: GameContainerProps) {
  const [gameState, setGameState] = useState<"loading" | "playing" | "ended">("loading")
  const { toast } = useToast()

  // Get the game from registry
  const game = gameRegistry.getGame(gameId)

  useEffect(() => {
    // Log initialization for debugging
    debugManager.logInfo("GameContainer", "Initializing game container", {
      gameId,
      playerId,
      playerName,
      isHost,
      gameMode,
    })

    // Set game to playing state after a short delay to ensure proper initialization
    const timer = setTimeout(() => {
      setGameState("playing")
      debugManager.logInfo("GameContainer", "Game state set to playing")
    }, 500)

    return () => clearTimeout(timer)
  }, [gameId, playerId, playerName, isHost, gameMode])

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

  // Show loading state while game initializes
  if (gameState === "loading") {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-800 rounded-lg">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-bold">Loading Game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Development Banner */}
      <div className="w-full bg-yellow-600 text-black font-bold text-center py-2 px-4 mb-2 rounded-t-md border-b-2 border-yellow-800">
        Sprite Sheet System Currently In Development
      </div>

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
