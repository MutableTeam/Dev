"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2 } from "lucide-react"
import Image from "next/image"
import SoundButton from "../sound-button"
import { gameRegistry } from "@/types/game-registry"

interface GameSelectionProps {
  publicKey: string
  balance: number | null
  mutbBalance: number
  onSelectGame: (gameId: string) => void
}

export default function GameSelection({ publicKey, balance, mutbBalance, onSelectGame }: GameSelectionProps) {
  // Get all games from registry
  const games = gameRegistry.getAllGames().map((game) => ({
    id: game.config.id,
    name: game.config.name,
    description: game.config.description,
    image: game.config.image,
    icon: game.config.icon,
    status: game.config.status,
    minWager: game.config.minWager,
  }))

  return (
    <Card className="bg-[#fbf3de] dark:bg-[#2a2a2a] border-2 border-black dark:border-[#555] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(80,80,80,1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            <CardTitle className="font-mono">MUTABLE GAMES</CardTitle>
          </div>
          <Badge
            variant="outline"
            className="bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
          >
            <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
            {mutbBalance.toFixed(2)} MUTB
          </Badge>
        </div>
        <CardDescription className="dark:text-gray-300">Select a game to play and wager MUTB tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game) => (
            <Card
              key={game.id}
              className={`border-2 ${
                game.status === "live" ? "border-black dark:border-[#555]" : "border-gray-300 dark:border-gray-600"
              } overflow-hidden dark:bg-[#1a1a1a]`}
            >
              <div className="relative">
                <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.name}
                  width={200}
                  height={120}
                  className="w-full h-32 object-cover dark:brightness-110 dark:contrast-110"
                />
                {game.status === "coming-soon" && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge className="bg-yellow-500 text-black font-mono">
                      {game.id === "pixel-pool" ? "IN DEVELOPMENT" : "COMING SOON"}
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="p-3">
                <div className="flex items-center gap-2">
                  <div className="bg-[#FFD54F] p-1 rounded-md border border-black">{game.icon}</div>
                  <CardTitle className="text-base font-mono dark:text-white">{game.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-sm text-muted-foreground dark:text-gray-300">{game.description}</p>
                <div className="mt-2 text-xs flex items-center gap-1 dark:text-gray-300">
                  <span className="font-medium">Min Wager:</span>
                  <div className="flex items-center">
                    <Image src="/images/mutable-token.png" alt="MUTB" width={12} height={12} />
                    <span>{game.minWager} MUTB</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3">
                <SoundButton
                  className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono dark:border-[#555] dark:shadow-[2px_2px_0px_0px_rgba(80,80,80,1)]"
                  disabled={game.status !== "live"}
                  onClick={() => onSelectGame(game.id)}
                >
                  {game.status === "live" ? "PLAY NOW" : "COMING SOON"}
                </SoundButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
