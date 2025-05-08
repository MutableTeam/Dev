"use client"

import { useState } from "react"
import Image from "next/image"
import { Sparkles } from "lucide-react"

export default function PromoWatermark() {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    // Open the claim tokens page in a new tab
    window.open("https://www.mutablepvp.com/claim-tokens", "_blank", "noopener,noreferrer")
  }

  return (
    <div className="fixed top-2 left-2 sm:top-3 sm:left-3 z-[99]">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-md transition-all duration-300 ${
          isHovered ? "bg-amber-500" : "bg-amber-400"
        } border border-amber-600 shadow-md text-xs sm:text-sm cursor-pointer`}
        style={{
          background: isHovered
            ? "linear-gradient(135deg, #f59f0b 0%, #fbbf24 50%, #f59f0b 100%)"
            : "linear-gradient(135deg, #fbbf24 0%, #f7e05b 50%, #fbbf24 100%)",
        }}
      >
        <div className="relative">
          <Image
            src="/images/mutable-token.png"
            alt="MUTB Token"
            width={16}
            height={16}
            className="rounded-full w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6"
          />
          {isHovered && (
            <Sparkles
              className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-300"
              style={{ filter: "drop-shadow(0 0 2px #fff)" }}
            />
          )}
        </div>
        <div className="font-bold text-[10px] sm:text-[10px] md:text-sm text-amber-900 whitespace-nowrap">
          <span className="inline xs:inline">Get </span>
          <span className="text-amber-800">100 Free MUTB</span>
        </div>
        <Sparkles
          className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 text-yellow-300 hidden sm:block"
          style={{ filter: "drop-shadow(0 0 2px #fff)" }}
        />
      </button>
    </div>
  )
}
