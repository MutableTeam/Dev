import type React from "react"
import "./globals.css"
import "../styles/ios-dark-mode.css"
import "../styles/ios-dark-mode-overrides.css"
import "@/styles/game-container.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { GameProvider } from "@/contexts/game-context"
import { IOSDarkModeFix } from "@/components/ios-dark-mode-fix"
import IOSDarkModeScript from "./ios-dark-mode-script"
import { inter, pressStart2P } from "./fonts"

export const metadata: Metadata = {
  title: "MutableDev Game Platform",
  description: "A modular game platform for web3 games",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart2P.variable}`}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={inter.className}>
        <IOSDarkModeScript />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <IOSDarkModeFix />
          <GameProvider>{children}</GameProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
