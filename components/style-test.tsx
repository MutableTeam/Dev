"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StyleSwitcher } from "@/components/style-switcher"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"

export function StyleTest() {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Style Test</h2>
        <StyleSwitcher />
      </div>

      <Card className={isCyberpunk ? "border-[#00f0ff] border-opacity-50 bg-[#0a0a24]" : ""}>
        <CardHeader>
          <CardTitle className={isCyberpunk ? "text-[#00f0ff]" : ""}>Current Style: {styleMode}</CardTitle>
          <CardDescription>Click the button in the top right to toggle between styles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className={isCyberpunk ? "text-[#f0f0ff]" : ""}>
            This component demonstrates the style switcher functionality.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className={isCyberpunk ? "bg-[#1a1a4a] text-[#00f0ff] border border-[#00f0ff] border-opacity-50" : ""}
          >
            Test Button
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
