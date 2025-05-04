"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { isIOS } from "@/utils/ios-dark-mode"

interface ThemeToggleProps {
  size?: "default" | "sm"
}

export function ThemeToggle({ size = "default" }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isIOSDevice, setIsIOSDevice] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setIsIOSDevice(isIOS())
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    // Apply iOS-specific class for immediate visual feedback
    if (isIOSDevice) {
      if (newTheme === "dark") {
        document.documentElement.classList.add("ios-dark")
      } else {
        document.documentElement.classList.remove("ios-dark")
      }
    }
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled className={size === "sm" ? "w-8 h-8" : "w-10 h-10"}>
        <Sun className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`${size === "sm" ? "w-8 h-8" : "w-10 h-10"} bg-background border-border hover:bg-accent hover:text-accent-foreground dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700`}
      aria-label="Toggle theme"
    >
      <Sun
        className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0`}
      />
      <Moon
        className={`absolute ${size === "sm" ? "h-4 w-4" : "h-5 w-5"} rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
