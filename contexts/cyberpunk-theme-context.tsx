"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { cyberpunkTheme, cyberpunkColors, cyberpunkAnimations } from "@/styles/cyberpunk-theme"

type StyleMode = "regular" | "cyberpunk"

interface CyberpunkThemeContextType {
  styleMode: StyleMode
  setStyleMode: (mode: StyleMode) => void
  toggleStyleMode: () => void
  theme: typeof cyberpunkTheme
  colors: typeof cyberpunkColors
  animations: typeof cyberpunkAnimations
}

const CyberpunkThemeContext = createContext<CyberpunkThemeContextType | undefined>(undefined)

export function CyberpunkThemeProvider({ children }: { children: React.ReactNode }) {
  const [styleMode, setStyleMode] = useState<StyleMode>("regular")

  // Load preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("styleMode") as StyleMode | null
    if (savedMode && (savedMode === "regular" || savedMode === "cyberpunk")) {
      setStyleMode(savedMode)
    }
  }, [])

  // Save preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem("styleMode", styleMode)

    // Apply global CSS variables for cyberpunk mode
    if (styleMode === "cyberpunk") {
      document.documentElement.classList.add("cyberpunk-mode")
    } else {
      document.documentElement.classList.remove("cyberpunk-mode")
    }
  }, [styleMode])

  const toggleStyleMode = () => {
    setStyleMode((prev) => (prev === "regular" ? "cyberpunk" : "regular"))
  }

  return (
    <CyberpunkThemeContext.Provider
      value={{
        styleMode,
        setStyleMode,
        toggleStyleMode,
        theme: cyberpunkTheme,
        colors: cyberpunkColors,
        animations: cyberpunkAnimations,
      }}
    >
      {children}
    </CyberpunkThemeContext.Provider>
  )
}

export function useCyberpunkTheme() {
  const context = useContext(CyberpunkThemeContext)
  if (context === undefined) {
    throw new Error("useCyberpunkTheme must be used within a CyberpunkThemeProvider")
  }
  return context
}
