import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/game-container.css"
import "../styles/wallet-connector.css"
import "../styles/promo-watermark.css"
import "../styles/touch-controls.css"
import "../styles/retro-arcade.css"
import { ThemeProvider } from "@/components/theme-provider"
import IOSDarkModeScript from "./ios-dark-mode-script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mutable Dev",
  description: "Mutable Development Platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <IOSDarkModeScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
