"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import SoundButton from "./sound-button"
import { withClickSound } from "@/utils/sound-utils"
import { debugManager } from "@/utils/debug-utils"

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
            className={`bg-[#fbf3de] dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col ${
              isFullscreen ? "w-full h-full" : "w-[95%] h-[95%] max-w-7xl"
            }`}
            layoutId="game-container"
          >
            {/* Header */}
            <div className="bg-[#FFD54F] dark:bg-[#D4AF37] border-b-4 border-black dark:border-gray-700 p-3 flex items-center justify-between">
              <h2 className="font-mono font-bold text-black text-lg">{title}</h2>
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

            {/* Game Content */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-gray-900">
              <div className="game-container-wrapper h-full w-full flex items-center justify-center">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
