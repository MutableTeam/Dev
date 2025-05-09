"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { debugManager } from "@/utils/debug-utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk animations
const glitchAnim = keyframes`
  0% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 255, 0.75), -0.05em -0.025em 0 rgba(0, 255, 255, 0.75);
  }
  14% {
    text-shadow: 0.05em 0 0 rgba(255, 0, 255, 0.75), -0.05em -0.025em 0 rgba(0, 255, 255, 0.75);
  }
  15% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 255, 0.75), 0.025em 0.025em 0 rgba(0, 255, 255, 0.75);
  }
  49% {
    text-shadow: -0.05em -0.025em 0 rgba(255, 0, 255, 0.75), 0.025em 0.025em 0 rgba(0, 255, 255, 0.75);
  }
  50% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 255, 0.75), 0.05em 0 0 rgba(0, 255, 255, 0.75);
  }
  99% {
    text-shadow: 0.025em 0.05em 0 rgba(255, 0, 255, 0.75), 0.05em 0 0 rgba(0, 255, 255, 0.75);
  }
  100% {
    text-shadow: -0.025em 0 0 rgba(255, 0, 255, 0.75), -0.025em -0.025em 0 rgba(0, 255, 255, 0.75);
  }
`

const scanlineAnim = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
`

const CyberHeader = styled.div`
  background: linear-gradient(90deg, #0a0a24 0%, #1a1a4a 100%);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
    z-index: 1;
  }
`

const CyberTitle = styled.h2`
  color: #0ff;
  font-family: monospace;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  position: relative;
  
  &.active {
    animation: ${glitchAnim} 2s infinite alternate;
  }
`

const CyberButton = styled(SoundButton)`
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #0ff;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

interface GamePopOutContainerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function GamePopOutContainer({
  isOpen,
  onClose,
  title = "MUTABLE GAME",
  children,
}: GamePopOutContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Format the title - if it's "Archer Arena: Last Stand", change to "AA: Last Stand"
  const formattedTitle = title === "ARCHER ARENA: LAST STAND" ? "AA: LAST STAND" : title

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen, onClose])

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => {
          debugManager.logError("Fullscreen", "Error attempting to enable fullscreen mode:", err)
        })
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Handle game sizing and resizing
  useEffect(() => {
    const resizeGameToFit = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight - 56 // Subtract header height

      // Find game canvas element
      const gameCanvas = containerRef.current.querySelector("canvas")
      if (!gameCanvas) return

      // Calculate the aspect ratio
      const gameAspectRatio = gameCanvas.width / gameCanvas.height
      const containerAspectRatio = containerWidth / containerHeight

      // Determine dimensions based on aspect ratio
      let newWidth, newHeight

      if (containerAspectRatio > gameAspectRatio) {
        // Container is wider than game
        newHeight = containerHeight * 0.95 // 95% of available height
        newWidth = newHeight * gameAspectRatio
      } else {
        // Container is taller than game
        newWidth = containerWidth * 0.95 // 95% of available width
        newHeight = newWidth / gameAspectRatio
      }

      // Apply scaling
      gameCanvas.style.width = `${newWidth}px`
      gameCanvas.style.height = `${newHeight}px`
      gameCanvas.style.display = "block"
    }

    // Initial sizing
    if (isOpen) {
      // Small delay to ensure DOM is ready
      setTimeout(resizeGameToFit, 100)
    }

    // Add resize listener
    window.addEventListener("resize", resizeGameToFit)

    // Cleanup
    return () => window.removeEventListener("resize", resizeGameToFit)
  }, [isOpen])

  // Add a new useEffect to automatically enter fullscreen mode when the container opens
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        if (containerRef.current && document.fullscreenEnabled) {
          containerRef.current.requestFullscreen().catch((err) => {
            debugManager.logWarning("Fullscreen", "Could not enter fullscreen mode automatically:", err)
            // If fullscreen fails, we still want to show the container in a large size
            setIsFullscreen(false)
          })
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            ref={containerRef}
            className={`${
              isCyberpunk
                ? "bg-[#0a0a24] border-[1px] border-[#0ff]/30"
                : "bg-[#fbf3de] dark:bg-gray-800 border-4 border-black dark:border-gray-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"
            } rounded-lg overflow-hidden flex flex-col ${isFullscreen ? "w-full h-full" : "w-[95%] h-[95%] max-w-7xl"}`}
            layoutId="game-container"
          >
            {/* Header */}
            {isCyberpunk ? (
              <CyberHeader className="p-3 flex items-center justify-between">
                <CyberTitle className={`font-mono font-bold text-lg ${title.includes("LAST STAND") ? "active" : ""}`}>
                  {formattedTitle}
                </CyberTitle>
                <div className="flex items-center gap-2">
                  <CyberButton
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={withClickSound(toggleFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                  </CyberButton>
                  <CyberButton variant="outline" size="icon" className="h-8 w-8" onClick={withClickSound(onClose)}>
                    <X size={16} />
                    <span className="sr-only">Close</span>
                  </CyberButton>
                </div>
              </CyberHeader>
            ) : (
              <div className="bg-[#FFD54F] dark:bg-[#D4AF37] border-b-4 border-black dark:border-gray-700 p-3 flex items-center justify-between">
                <h2 className="font-mono font-bold text-black text-lg">{formattedTitle}</h2>
                <div className="flex items-center gap-2">
                  <SoundButton
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-2 border-black bg-white hover:bg-gray-100 text-black"
                    onClick={withClickSound(toggleFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                  </SoundButton>
                  <SoundButton
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-2 border-black bg-white hover:bg-gray-100 text-black"
                    onClick={withClickSound(onClose)}
                  >
                    <X size={16} />
                    <span className="sr-only">Close</span>
                  </SoundButton>
                </div>
              </div>
            )}

            {/* Game Content */}
            <div
              className={`flex-1 overflow-hidden relative flex items-center justify-center ${isCyberpunk ? "bg-[#050510]" : "bg-gray-900"}`}
            >
              <div className="game-container-wrapper h-full w-full flex items-center justify-center">{children}</div>

              {/* Scanlines effect for cyberpunk mode */}
              {isCyberpunk && (
                <div
                  className="absolute inset-0 pointer-events-none z-10 opacity-10"
                  style={{
                    backgroundImage: "linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 50%)",
                    backgroundSize: "100% 4px",
                    animation: `${scanlineAnim} 10s linear infinite`,
                  }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
