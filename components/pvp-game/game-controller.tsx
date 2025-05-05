"use client"

import { useEffect, useRef, useState } from "react"
import { createInitialGameState, createPlayer, type GameState, updateGameState } from "./game-engine"
import GameRenderer from "./game-renderer"
import DebugOverlay from "./debug-overlay"
import {
  initializeAudio,
  playBowDrawSound,
  playBowReleaseSound,
  playBowFullDrawSound,
  playSpecialAttackSound,
  playHitSound,
  playDeathSound,
  playDashSound,
  playGameOverSound,
  playVictorySound,
  startBackgroundMusic,
  stopBackgroundMusic,
  audioManager,
} from "@/utils/audio-manager"
import { debugManager, DebugLevel } from "@/utils/debug-utils"
import transitionDebugger from "@/utils/transition-debug"
import ResourceMonitor from "@/components/resource-monitor"

interface GameControllerProps {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode?: string
  onGameEnd?: (winner: string | null) => void
}

export default function GameController({
  playerId,
  playerName,
  isHost,
  gameMode = "duel",
  onGameEnd,
}: GameControllerProps) {
  // Use a function to initialize state to ensure it's only created once
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialState = createInitialGameState()
    return initialState
  })

  const gameStateRef = useRef<GameState>(gameState)
  const lastUpdateTimeRef = useRef<number>(Date.now())
  const requestAnimationFrameIdRef = useRef<number | null>(null)
  const bowSoundPlayedRef = useRef<boolean>(false)
  const fullDrawSoundPlayedRef = useRef<boolean>(false)
  const specialSoundPlayedRef = useRef<boolean>(false)
  const audioInitializedRef = useRef<boolean>(false)
  const gameInitializedRef = useRef<boolean>(false)
  const [showDebug, setShowDebug] = useState<boolean>(false)
  const [showResourceMonitor, setShowResourceMonitor] = useState<boolean>(false)
  const componentIdRef = useRef<string>(`game-controller-${Date.now()}`)

  // Initialize debug system
  useEffect(() => {
    // Enable debug system with more verbose logging
    debugManager.updateConfig({
      enabled: true,
      level: DebugLevel.DEBUG,
      capturePerformance: true,
    })

    debugManager.logInfo("GAME", "Debug system initialized for game controller")
    transitionDebugger.trackTransition("none", "initialized", "GameController")

    // Set up keyboard shortcuts for debug tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F8 to toggle debug overlay
      if (e.key === "F8") {
        setShowDebug((prev) => !prev)
      }

      // F9 to capture state snapshot
      if (e.key === "F9") {
        debugManager.captureState(gameStateRef.current, "Manual Snapshot")
        debugManager.logInfo("GAME", "Manual state snapshot captured")
      }

      // F11 to toggle resource monitor
      if (e.key === "F11") {
        setShowResourceMonitor((prev) => !prev)
      }
    }

    transitionDebugger.safeAddEventListener(
      window,
      "keydown",
      handleKeyDown,
      undefined,
      `${componentIdRef.current}-keydown`,
    )

    return () => {
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-keydown`)
    }
  }, [])

  // Initialize game
  useEffect(() => {
    // Prevent multiple initializations
    if (gameInitializedRef.current) return

    // Enable global error tracking
    debugManager.setupGlobalErrorTracking()

    // Track component mount
    debugManager.trackComponentMount("GameController", {
      playerId,
      playerName,
      isHost,
      gameMode,
    })

    transitionDebugger.trackTransition("initialized", "mounting", "GameController")

    // Make game state available globally for debugging
    if (typeof window !== "undefined") {
      ;(window as any).__gameStateRef = gameStateRef
    }

    gameInitializedRef.current = true

    debugManager.logInfo("GAME", `Initializing game with mode: ${gameMode}`)

    // Initialize audio system
    initializeAudio()
      .then(() => {
        audioInitializedRef.current = true
        debugManager.logInfo("AUDIO", "Audio system initialized")
      })
      .catch((err) => {
        debugManager.logError("AUDIO", "Failed to initialize audio", err)
      })

    // Create local player
    const playerColors = ["#FF5252", "#4CAF50", "#2196F3", "#FFC107"]
    const playerPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 500 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
    ]

    // Use the current game state
    const currentState = { ...gameStateRef.current }

    // Add local player
    currentState.players[playerId] = createPlayer(playerId, playerName, playerPositions[0], playerColors[0])
    debugManager.logInfo("GAME", `Created player with ID: ${playerId}, name: ${playerName}`)

    // Determine number of AI opponents based on game mode
    let aiCount = 1 // Default for duel
    if (gameMode === "ffa" || gameMode === "timed") {
      aiCount = 3 // For FFA or timed match
    }

    debugManager.logInfo("GAME", `Adding ${aiCount} AI opponents for game mode: ${gameMode}`)

    // Add AI players
    for (let i = 1; i <= aiCount; i++) {
      const aiId = `ai-${i}`
      currentState.players[aiId] = createPlayer(
        aiId,
        `AI ${i}`,
        playerPositions[i % playerPositions.length],
        playerColors[i % playerColors.length],
      )
    }

    // Update state
    setGameState(currentState)
    gameStateRef.current = currentState

    // Capture initial state
    debugManager.captureState(currentState, "Initial State")

    transitionDebugger.trackTransition("mounting", "mounted", "GameController")

    // Set up crash detection timer
    const crashDetectionTimer = transitionDebugger.safeSetInterval(
      () => {
        // Check if game has been running for at least 5 seconds
        const gameTime = gameStateRef.current.gameTime

        if (gameTime > 0 && gameTime < 5) {
          debugManager.logInfo("CRASH_DETECTION", "Game is in early stage, monitoring for crashes")

          // Capture state more frequently during this critical period
          debugManager.captureState(gameStateRef.current, "Early Game State")
        }
      },
      1000,
      `${componentIdRef.current}-crash-detection`,
    )

    // Start game loop
    const gameLoop = (timestamp: number) => {
      try {
        debugManager.startFrame()

        const now = Date.now()
        const deltaTime = Math.min((now - lastUpdateTimeRef.current) / 1000, 0.1) // Cap delta time to prevent large jumps
        lastUpdateTimeRef.current = now

        // Track entity counts
        const entityCounts = {
          players: Object.keys(gameStateRef.current.players).length,
          arrows: gameStateRef.current.arrows.length,
          walls: gameStateRef.current.walls.length,
          pickups: gameStateRef.current.pickups.length,
        }

        debugManager.trackEntities(entityCounts)

        // Check for potential memory leaks
        if (gameStateRef.current.arrows.length > 100) {
          debugManager.logWarning("GAME_LOOP", "Possible memory leak: Too many arrows", {
            arrowCount: gameStateRef.current.arrows.length,
          })

          // Safety cleanup - remove oldest arrows if too many
          if (gameStateRef.current.arrows.length > 200) {
            gameStateRef.current.arrows = gameStateRef.current.arrows.slice(-100)
            debugManager.logInfo("GAME_LOOP", "Performed safety cleanup of arrows")
          }
        }

        // Update game state with error handling and timeout protection
        let newState = gameStateRef.current

        // Use a promise with timeout to prevent infinite loops in updateGameState
        const updateWithTimeout = () => {
          return new Promise((resolve, reject) => {
            // Set timeout to catch infinite loops
            const timeoutId = setTimeout(() => {
              reject(new Error("Game update timed out - possible infinite loop"))
            }, 500) // 500ms should be more than enough for a single frame

            try {
              const result = updateGameState(gameStateRef.current, deltaTime)
              clearTimeout(timeoutId)
              resolve(result)
            } catch (error) {
              clearTimeout(timeoutId)
              reject(error)
            }
          })
        }

        // Try to update with timeout protection
        updateWithTimeout()
          .then((result) => {
            newState = result as GameState
            continueGameLoop(newState)
          })
          .catch((error) => {
            debugManager.logError("GAME_LOOP", "Error in game update", error)
            debugManager.captureState(gameStateRef.current, "Update Error State")
            // Continue with old state
            continueGameLoop(gameStateRef.current)
          })

        function continueGameLoop(state: GameState) {
          // Check for sound effects for the local player
          const localPlayer = state.players[playerId]
          if (localPlayer && audioInitializedRef.current && !audioManager.isSoundMuted()) {
            // Only try to play sounds if audio is initialized and not muted
            try {
              // Sound effect code remains the same...
              // (keeping the existing sound effect code)

              // Bow drawing sound
              if (localPlayer.isDrawingBow && !bowSoundPlayedRef.current) {
                playBowDrawSound()
                bowSoundPlayedRef.current = true
              }

              // Full draw sound (when bow is fully drawn)
              if (localPlayer.isDrawingBow && localPlayer.drawStartTime) {
                const currentTime = Date.now() / 1000
                const drawTime = currentTime - localPlayer.drawStartTime

                if (drawTime >= localPlayer.maxDrawTime && !fullDrawSoundPlayedRef.current) {
                  playBowFullDrawSound()
                  fullDrawSoundPlayedRef.current = true
                }
              }

              // Bow release sound
              if (!localPlayer.isDrawingBow && gameStateRef.current.players[playerId]?.isDrawingBow) {
                playBowReleaseSound()
                bowSoundPlayedRef.current = false
                fullDrawSoundPlayedRef.current = false
              }

              // Special attack sound
              if (localPlayer.isChargingSpecial && !specialSoundPlayedRef.current) {
                specialSoundPlayedRef.current = true
              }

              // Special attack release sound
              if (!localPlayer.isChargingSpecial && gameStateRef.current.players[playerId]?.isChargingSpecial) {
                playSpecialAttackSound()
                specialSoundPlayedRef.current = false
              }

              // Dash sound
              if (localPlayer.isDashing && !gameStateRef.current.players[playerId]?.isDashing) {
                playDashSound()
              }

              // Hit sound
              if (
                localPlayer.animationState === "hit" &&
                gameStateRef.current.players[playerId]?.animationState !== "hit"
              ) {
                playHitSound()
              }

              // Death sound
              if (
                localPlayer.animationState === "death" &&
                gameStateRef.current.players[playerId]?.animationState !== "death"
              ) {
                playDeathSound()
              }
            } catch (error) {
              debugManager.logError("AUDIO", "Error playing game sounds", error)
              // Continue game even if sound playback fails
            }
          }

          gameStateRef.current = state
          setGameState(state)

          // Check for game over
          if (state.isGameOver && onGameEnd) {
            // Play appropriate game over sound
            if (!audioManager.isSoundMuted()) {
              if (state.winner === playerId) {
                playVictorySound()
              } else {
                playGameOverSound()
              }
            }

            // Stop background music
            stopBackgroundMusic()

            transitionDebugger.trackTransition("playing", "game-over", "GameController")

            onGameEnd(state.winner)

            // Log game end
            debugManager.logInfo("GAME", "Game ended", {
              winner: state.winner,
              gameTime: state.gameTime,
              playerCount: Object.keys(state.players).length,
            })
          } else {
            // Continue game loop
            requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
              gameLoop,
              `${componentIdRef.current}-game-loop`,
            )
          }

          debugManager.endFrame()
        }
      } catch (error) {
        debugManager.logError("GAME_LOOP", "Critical error in game loop", error)

        // Capture state for debugging
        debugManager.captureState(gameStateRef.current, "Critical Error State")

        // Try to continue the game loop after a short delay
        setTimeout(() => {
          requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
            gameLoop,
            `${componentIdRef.current}-game-loop`,
          )
        }, 1000) // 1 second delay to prevent rapid error loops
      }
    }

    // Start game loop
    requestAnimationFrameIdRef.current = transitionDebugger.safeRequestAnimationFrame(
      gameLoop,
      `${componentIdRef.current}-game-loop`,
    )

    // Start background music if not muted
    if (!audioManager.isSoundMuted()) {
      try {
        const musicPromise = startBackgroundMusic()
        if (musicPromise && typeof musicPromise.catch === "function") {
          musicPromise.catch((err) => {
            debugManager.logWarning("AUDIO", "Failed to start background music", err)
          })
        }
      } catch (err) {
        debugManager.logWarning("AUDIO", "Error starting background music", err)
      }
    }

    // Set up keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStateRef.current.players[playerId]) return

      const player = gameStateRef.current.players[playerId]

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          player.controls.up = true
          break
        case "s":
        case "arrowdown":
          player.controls.down = true
          break
        case "a":
        case "arrowleft":
          player.controls.left = true
          break
        case "d":
        case "arrowright":
          player.controls.right = true
          break
        case "shift":
          player.controls.dash = true
          break
        // Toggle debug mode with F3
        case "f3":
          setShowDebug((prev) => !prev)
          break
        // Toggle mute with M
        case "m":
          audioManager.toggleMute()
          break
        case "f10":
          setShowDiagnostics((prev) => !prev)
          break
        case "f11":
          setShowResourceMonitor((prev) => !prev)
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameStateRef.current.players[playerId]) return

      const player = gameStateRef.current.players[playerId]

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          player.controls.up = false
          break
        case "s":
        case "arrowdown":
          player.controls.down = false
          break
        case "a":
        case "arrowleft":
          player.controls.left = false
          break
        case "d":
        case "arrowright":
          player.controls.right = false
          break
        case "shift":
          player.controls.dash = false
          break
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameStateRef.current.players[playerId]) return

      const player = gameStateRef.current.players[playerId]
      const canvas = document.querySelector("canvas")
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()

      // Calculate mouse position relative to canvas
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate angle between player and mouse
      const dx = mouseX - player.position.x
      const dy = mouseY - player.position.y
      player.rotation = Math.atan2(dy, dx)
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (!gameStateRef.current.players[playerId]) return

      if (e.button === 0) {
        // Left click - start drawing bow
        gameStateRef.current.players[playerId].controls.shoot = true
      } else if (e.button === 2) {
        // Right click - start charging special attack
        gameStateRef.current.players[playerId].controls.special = true
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!gameStateRef.current.players[playerId]) return

      if (e.button === 0) {
        // Left click release - fire arrow
        gameStateRef.current.players[playerId].controls.shoot = false
      } else if (e.button === 2) {
        // Right click release - fire special attack
        gameStateRef.current.players[playerId].controls.special = false
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault() // Prevent context menu on right click
    }

    // Add event listeners using our safe methods
    transitionDebugger.safeAddEventListener(
      window,
      "keydown",
      handleKeyDown,
      undefined,
      `${componentIdRef.current}-game-keydown`,
    )
    transitionDebugger.safeAddEventListener(
      window,
      "keyup",
      handleKeyUp,
      undefined,
      `${componentIdRef.current}-game-keyup`,
    )
    transitionDebugger.safeAddEventListener(
      document,
      "mousemove",
      handleMouseMove,
      undefined,
      `${componentIdRef.current}-mousemove`,
    )
    transitionDebugger.safeAddEventListener(
      document,
      "mousedown",
      handleMouseDown,
      undefined,
      `${componentIdRef.current}-mousedown`,
    )
    transitionDebugger.safeAddEventListener(
      document,
      "mouseup",
      handleMouseUp,
      undefined,
      `${componentIdRef.current}-mouseup`,
    )
    transitionDebugger.safeAddEventListener(
      document,
      "contextmenu",
      handleContextMenu,
      undefined,
      `${componentIdRef.current}-contextmenu`,
    )

    // Resume audio context on user interaction
    const resumeAudio = () => {
      if (!audioManager.isSoundMuted()) {
        audioManager.resumeAudioContext()
      }
    }
    transitionDebugger.safeAddEventListener(
      document,
      "click",
      resumeAudio,
      undefined,
      `${componentIdRef.current}-resume-audio`,
    )

    // Clear memory tracking interval
    clearInterval(memoryTrackingInterval)

    // Track component unmount
    debugManager.trackComponentUnmount("GameController", "useEffect cleanup")

    // Clean up
    return () => {
      transitionDebugger.trackTransition("any", "unmounting", "GameController")

      // Cancel animation frame
      if (requestAnimationFrameIdRef.current !== null) {
        transitionDebugger.safeCancelAnimationFrame(`${componentIdRef.current}-game-loop`)
        requestAnimationFrameIdRef.current = null
        transitionDebugger.trackCleanup("GameController", "Animation Frame", true)
      }

      // Remove all event listeners
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-game-keydown`)
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-game-keyup`)
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mousemove`)
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mousedown`)
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-mouseup`)
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-contextmenu`)
      transitionDebugger.safeRemoveEventListener(`${componentIdRef.current}-resume-audio`)

      // Clear intervals
      transitionDebugger.safeClearInterval(`${componentIdRef.current}-crash-detection`)

      // Stop background music
      try {
        stopBackgroundMusic()
        transitionDebugger.trackCleanup("GameController", "Background Music", true)
      } catch (err) {
        debugManager.logWarning("AUDIO", "Error stopping background music", err)
        transitionDebugger.trackCleanup("GameController", "Background Music", false, err)
      }

      debugManager.logInfo("GAME", "Game cleanup completed")
      transitionDebugger.trackTransition("unmounting", "unmounted", "GameController")
      debugManager.trackComponentUnmount("GameController")
    }
  }, [playerId, playerName, isHost, gameMode, onGameEnd])

  // Update AI players
  useEffect(() => {
    const aiUpdateInterval = transitionDebugger.safeSetInterval(
      () => {
        try {
          Object.keys(gameStateRef.current.players).forEach((id) => {
            if (id.startsWith("ai-")) {
              const ai = gameStateRef.current.players[id]
              if (!ai) return // Skip if AI player doesn't exist

              // Simple AI: move randomly and shoot occasionally
              ai.controls.up = Math.random() > 0.7
              ai.controls.down = Math.random() > 0.7 && !ai.controls.up
              ai.controls.left = Math.random() > 0.7
              ai.controls.right = Math.random() > 0.7 && !ai.controls.left

              // Randomly shoot arrows
              if (Math.random() > 0.95 && !ai.isDrawingBow) {
                ai.controls.shoot = true

                // Release arrow after a random time
                transitionDebugger.safeSetTimeout(
                  () => {
                    try {
                      if (gameStateRef.current.players[id]) {
                        gameStateRef.current.players[id].controls.shoot = false
                      }
                    } catch (error) {
                      debugManager.logError("AI", "Error in AI arrow release", error)
                    }
                  },
                  Math.random() * 1000 + 200,
                  `${componentIdRef.current}-ai-${id}-release-arrow`,
                )
              }

              // Randomly use special attack
              if (Math.random() > 0.98 && !ai.isChargingSpecial && ai.specialAttackCooldown <= 0) {
                ai.controls.special = true

                // Release special after a random time
                transitionDebugger.safeSetTimeout(
                  () => {
                    try {
                      if (gameStateRef.current.players[id]) {
                        gameStateRef.current.players[id].controls.special = false
                      }
                    } catch (error) {
                      debugManager.logError("AI", "Error in AI special release", error)
                    }
                  },
                  Math.random() * 500 + 500,
                  `${componentIdRef.current}-ai-${id}-release-special`,
                )
              }

              // Randomly dash
              ai.controls.dash = Math.random() > 0.95

              // Randomly change rotation
              if (Math.random() > 0.9) {
                ai.rotation = Math.random() * Math.PI * 2
              }
            }
          })
        } catch (error) {
          debugManager.logError("AI", "Error in AI update interval", error)
        }
      },
      500,
      `${componentIdRef.current}-ai-update`,
    )

    return () => {
      transitionDebugger.safeClearInterval(`${componentIdRef.current}-ai-update`)
    }
  }, [])

  // Track renders
  useEffect(() => {
    debugManager.trackComponentRender("GameController")
  })

  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false)
  const memoryTrackingInterval = useRef<NodeJS.Timeout | null>(null)

  // Show loading state while game initializes
  if (!gameState) {
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
    <div className="relative">
      <GameRenderer gameState={gameState} localPlayerId={playerId} />
      <DebugOverlay gameState={gameState} localPlayerId={playerId} visible={showDebug} />

      {/* Resource Monitor */}
      <ResourceMonitor visible={showResourceMonitor} position="bottom-right" />

      {/* Small hint text */}
      <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
        Press M to toggle sound | F3 for debug | F8 for game debug | F11 for resource monitor
      </div>
    </div>
  )
}
