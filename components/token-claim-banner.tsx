"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { cn } from "@/lib/utils"

export default function TokenClaimBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const { isCyberpunkTheme } = useCyberpunkTheme()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 py-3 px-4 sm:px-6 flex items-center justify-between",
        isCyberpunkTheme
          ? "bg-[#0a0b1e] border-t-2 border-[#00eeff] text-white"
          : "bg-gradient-to-r from-purple-900 to-blue-900 text-white",
      )}
    >
      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4">
        <div className={cn("hidden sm:block", isCyberpunkTheme ? "text-[#00eeff]" : "text-yellow-300")}>🎮</div>
        <p className="text-sm sm:text-base font-medium">
          <span className={cn("font-bold", isCyberpunkTheme ? "text-[#00eeff]" : "text-yellow-300")}>
            CLAIM UP TO 100 FREE MUTB TOKENS!
          </span>{" "}
          Sign up today and join the arcade revolution.
        </p>
        <a
          href="https://www.mutablepvp.com/claim-tokens"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "px-4 py-1.5 text-sm font-bold rounded whitespace-nowrap",
            isCyberpunkTheme
              ? "bg-[#00eeff] text-[#0a0b1e] hover:bg-[#00bbcc] border border-[#00eeff]"
              : "bg-yellow-300 text-purple-900 hover:bg-yellow-400",
          )}
        >
          CLAIM NOW
        </a>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 p-1 rounded-full hover:bg-black/20"
        aria-label="Close banner"
      >
        <X size={18} />
      </button>
    </div>
  )
}
