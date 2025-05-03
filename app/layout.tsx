import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { GameProvider } from "@/contexts/game-context"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GameProvider>{children}</GameProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
