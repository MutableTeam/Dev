"use client"

import { useEffect, useRef, useState } from "react"
import nipplejs, { type JoystickManager, type JoystickOutputData } from "nipplejs"
import { useMobile } from "@/hooks/use-mobile"

interface VirtualJoystickProps {
  onMove?: (x: number, y: number) => void
  onEnd?: () => void
  position?: "left" | "right"
  size?: number
  color?: string
}

export default function VirtualJoystick({
  onMove,
  onEnd,
  position = "left",
  size = 100,
  color = "rgba(255, 255, 255, 0.5)",
}: VirtualJoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const managerRef = useRef<JoystickManager | null>(null)
  const { isMobile, isTablet, isTouchDevice } = useMobile()
  const [isVisible, setIsVisible] = useState(false)

  // Force visibility for debugging
  useEffect(() => {
    console.log("Joystick visibility check:", { isMobile, isTablet, isTouchDevice })

    // Show joystick on touch devices
    setIsVisible(isTouchDevice || isMobile || isTablet)

    // Add a class to the body when touch controls are active
    if (isTouchDevice || isMobile || isTablet) {
      document.body.classList.add("touch-controls-active")
    } else {
      document.body.classList.remove("touch-controls-active")
    }
  }, [isMobile, isTablet, isTouchDevice])

  useEffect(() => {
    if (!joystickRef.current || !isVisible) return

    // Position the joystick container
    const positionStyle = position === "left" ? { left: "20px" } : { right: "20px" }
    Object.assign(joystickRef.current.style, positionStyle)

    // Create the joystick
    const manager = nipplejs.create({
      zone: joystickRef.current,
      mode: "static",
      position: { left: "50%", top: "50%" },
      color: color,
      size: size,
      lockX: false,
      lockY: false,
    })

    // Handle joystick events
    manager.on("move", (_, data: JoystickOutputData) => {
      if (onMove && data.vector) {
        // Normalize the vector to get direction
        const force = Math.min(data.force || 1, 1) // Cap force at 1
        onMove(data.vector.x * force, data.vector.y * force)
      }
    })

    manager.on("end", () => {
      if (onEnd) {
        onEnd()
      }
    })

    managerRef.current = manager

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy()
      }
    }
  }, [onMove, onEnd, position, size, color, isVisible])

  // For debugging, always show a message if not visible
  if (!isVisible) {
    console.log("Joystick not visible", { isMobile, isTablet, isTouchDevice })
    return null
  }

  return (
    <div
      ref={joystickRef}
      className="fixed bottom-20 z-50 h-32 w-32 rounded-full bg-black/30 backdrop-blur-sm virtual-joystick"
      style={{ touchAction: "none" }}
    />
  )
}
