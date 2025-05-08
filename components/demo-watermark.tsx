"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

export default function DemoWatermark() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 flex items-start gap-2 bg-black/85 text-white text-sm px-3 py-2 rounded-md backdrop-blur-sm transition-all duration-300 cursor-pointer border border-red-500 shadow-lg shadow-red-500/30 hover:bg-red-900/80"
      style={{
        maxWidth: expanded ? "450px" : "220px",
        width: expanded ? "auto" : "auto",
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-red-400 mt-0.5" />
      <div className={expanded ? "" : "overflow-hidden"}>
        {expanded ? (
          <p className="text-xs sm:text-sm font-medium">
            This is a demo application.
            <br />
            No real transactions, simulated lobbies
            <br />
            and placeholder games.
            <br />
            Mobile Game Controls not currently supported.
          </p>
        ) : (
          <p className="whitespace-nowrap text-xs sm:text-sm font-medium">DEMO PURPOSES ONLY</p>
        )}
      </div>
    </div>
  )
}
