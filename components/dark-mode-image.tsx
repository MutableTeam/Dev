"use client"

import Image, { type ImageProps } from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface DarkModeImageProps extends Omit<ImageProps, "className"> {
  className?: string
  darkModeClass?: string
}

export default function DarkModeImage({
  className = "",
  darkModeClass = "brightness-110 contrast-110",
  ...props
}: DarkModeImageProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Image className={className} {...props} />
  }

  const isDark = theme === "dark" || resolvedTheme === "dark"
  const combinedClassName = isDark ? `${className} ${darkModeClass}` : className

  return <Image className={combinedClassName} {...props} />
}
