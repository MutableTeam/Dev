"use client"

import { useEffect, useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

interface TouchActionButtonsProps {
  onShoot?: () => void
  onShootEnd?: () => void
  onSpecial?: () => void
  onSpecialEnd?: () => void
  onDash?: () => void
}

export default function TouchActionButtons({
  onShoot,
  onShootEnd,
  onSpecial,
  onSpecialEnd,
  onDash,
}: TouchActionButtonsProps) {
  const { isMobile, isTablet } = useMobile()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show buttons on mobile or tablet
    setIsVisible(isMobile || isTablet)
  }, [isMobile, isTablet])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-4">
      {/* Shoot button */}
      <button
        className="h-16 w-16 rounded-full bg-red-500/70 text-white shadow-lg backdrop-blur-sm active:bg-red-600/90"
        onTouchStart={(e) => {
          e.preventDefault()
          if (onShoot) onShoot()
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          if (onShootEnd) onShootEnd()
        }}
        aria-label="Shoot"
      >
        <span className="sr-only">Shoot</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L4 10l8 2 2 8 8-8-10-10z" />
        </svg>
      </button>

      {/* Special attack button */}
      <button
        className="h-16 w-16 rounded-full bg-blue-500/70 text-white shadow-lg backdrop-blur-sm active:bg-blue-600/90"
        onTouchStart={(e) => {
          e.preventDefault()
          if (onSpecial) onSpecial()
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          if (onSpecialEnd) onSpecialEnd()
        }}
        aria-label="Special Attack"
      >
        <span className="sr-only">Special Attack</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>

      {/* Dash button */}
      <button
        className="h-16 w-16 rounded-full bg-yellow-500/70 text-white shadow-lg backdrop-blur-sm active:bg-yellow-600/90"
        onTouchStart={(e) => {
          e.preventDefault()
          if (onDash) onDash()
        }}
        aria-label="Dash"
      >
        <span className="sr-only">Dash</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
