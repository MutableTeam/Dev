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
  const { isMobile, isTablet } = useMobile()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show joystick on mobile or tablet
    setIsVisible(isMobile || isTablet)
  }, [isMobile, isTablet])

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

  if (!isVisible) return null

  return (
    <div
      ref={joystickRef}
      className="fixed bottom-20 z-50 h-32 w-32 rounded-full bg-black/10 backdrop-blur-sm"
      style={{ touchAction: "none" }}
    />
  )
}
