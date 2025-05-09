"use client"

import { useState, useEffect } from "react"
import LastStandGame from "./game-component" // Fixed import
import { Instructions } from "./instructions"
import GamePopOutContainer from "@/components/game-pop-out-container"
import { debugManager } from "@/utils/debug-utils"

interface LastStandGameProps {
  onClose?: () => void
  isPopOut?: boolean
  initialWager?: number
}

export default function LastStandGameWrapper({ onClose, isPopOut = false, initialWager = 0 }: LastStandGameProps) {
  const [showInstructions, setShowInstructions] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [wager, setWager] = useState(initialWager)

  // Log component lifecycle for debugging
  useEffect(() => {
    debugManager.logInfo("LastStandGame", "Component mounted")
    return () => {
      debugManager.logInfo("LastStandGame", "Component unmounted")
    }
  }, [])

  // Handle starting the game
  const handleStartGame = (selectedWager: number) => {
    setWager(selectedWager)
    setShowInstructions(false)
    setGameStarted(true)
    debugManager.logInfo("LastStandGame", `Game started with wager: ${selectedWager}`)
  }

  // Handle returning to instructions
  const handleReturnToInstructions = () => {
    setGameStarted(false)
    setShowInstructions(true)
    debugManager.logInfo("LastStandGame", "Returned to instructions")
  }

  // Content to render
  const gameContent = (
    <>
      {showInstructions ? (
        <Instructions onStartGame={handleStartGame} initialWager={wager} />
      ) : (
        <LastStandGame onBack={handleReturnToInstructions} wager={wager} />
      )}
    </>
  )

  // If this is a pop-out, wrap in the pop-out container
  if (isPopOut) {
    return (
      <GamePopOutContainer isOpen={true} onClose={onClose || (() => {})} title="AA: LAST STAND">
        {gameContent}
      </GamePopOutContainer>
    )
  }

  // Otherwise, render directly
  return gameContent
}

export { LastStandGameWrapper as LastStandGame }
