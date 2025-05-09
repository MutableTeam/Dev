"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { createPortal } from "react-dom"

export default function DemoWatermark() {
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Use a portal to render the component at the root level of the DOM
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const watermarkContent = (
    <div
      className="fixed top-3 left-1/2 transform -translate-x-1/2 z-[9999] flex items-start gap-2 bg-black/85 text-white text-sm px-3 py-2 rounded-md backdrop-blur-sm transition-all duration-300 cursor-pointer border border-red-500 shadow-lg shadow-red-500/30 hover:bg-red-900/80"
      style={{
        maxWidth: expanded ? "450px" : "350px",
        width: expanded ? "auto" : "auto",
        pointerEvents: "auto",
        position: "fixed",
        isolation: "isolate",
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-red-400 mt-0.5" />
      <div className={expanded ? "" : "overflow-hidden"}>
        {expanded ? (
          <p className="text-xs sm:text-sm font-medium">
            No Real Transactions
            <br />
            Mobile Support In Development
          </p>
        ) : (
          <p className="whitespace-nowrap text-xs sm:text-sm font-medium">DEMO PURPOSES ONLY</p>
        )}
      </div>
    </div>
  )

  // Use a portal to render at the root level of the DOM
  return mounted ? createPortal(watermarkContent, document.body) : null
}
