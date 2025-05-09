"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2 } from "lucide-react"
import Image from "next/image"
import SoundButton from "../sound-button"
import { gameRegistry } from "@/types/game-registry"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import { Button } from "@/components/ui/button"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk animations
const cardHover = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3);
  }
`

const imageGlow = keyframes`
  0% {
    filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 5px rgba(255, 0, 255, 0.5));
  }
  100% {
    filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.5));
  }
`

const CyberGameCard = styled(Card)`
  background: rgba(16, 16, 48, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    animation: ${cardHover} 3s infinite alternate;
    
    .game-image {
      animation: ${imageGlow} 2s infinite alternate;
    }
    
    .cyber-play-button {
      background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
    z-index: 1;
  }
`

const CyberPlayButton = styled(Button)`
  background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  color: #000;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    background: linear-gradient(90deg, #666 0%, #333 100%);
    color: #aaa;
    box-shadow: none;
    transform: none;
  }
`

const CyberBadge = styled(Badge)`
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 1px;
`

interface GameSelectionProps {
  publicKey: string
  balance: number | null
  mutbBalance: number
  onSelectGame: (gameId: string) => void
}

export default function GameSelection({ publicKey, balance, mutbBalance, onSelectGame }: GameSelectionProps) {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  // Get all games from registry
  const allGames = gameRegistry.getAllGames().map((game) => ({
    id: game.config.id,
    name: game.config.name,
    description: game.config.description,
    image: game.config.image,
    icon: game.config.icon,
    status: game.config.status,
    minWager: game.config.minWager,
  }))

  // Sort games: available games first, then put "Archer Arena: Last Stand" next to "Archer Arena"
  const games = allGames.sort((a, b) => {
    // First, sort by status (live games first)
    if (a.status === "live" && b.status !== "live") return -1
    if (a.status !== "live" && b.status === "live") return 1

    // Then, ensure "Archer Arena: Last Stand" is next to "Archer Arena"
    if (a.name === "Archer Arena" && b.name === "Archer Arena: Last Stand") return -1
    if (a.name === "Archer Arena: Last Stand" && b.name === "Archer Arena") return 1

    // Default sort by name
    return a.name.localeCompare(b.name)
  })

  // Custom image override for Last Stand
  const getGameImage = (game) => {
    if (game.name === "Archer Arena: Last Stand") {
      return "/images/last-stand.jpg"
    }
    return game.image || "/placeholder.svg"
  }

  // Handle game selection with Google Analytics tracking
  const handleGameSelect = (gameId: string) => {
    // Get the game name for tracking
    const game = games.find((g) => g.id === gameId)

    if (game) {
      // Convert game name to kebab case for analytics
      const eventName = game.name.toLowerCase().replace(/\s+/g, "-")

      // Track the game selection in Google Analytics
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", eventName, {
          event_category: "Games",
          event_label: game.name,
        })
      }
    }

    // Call the original onSelectGame handler
    onSelectGame(gameId)
  }

  return (
    <Card className={isCyberpunk ? "" : "bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className={`h-5 w-5 ${isCyberpunk ? "text-[#0ff]" : ""}`} />
            <CardTitle className={isCyberpunk ? "" : "font-mono"}>MUTABLE GAMES</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={
              isCyberpunk
                ? "bg-[#0a0a24]/80 text-[#0ff] border border-[#0ff]/50 flex items-center gap-1 font-mono"
                : "bg-[#FFD54F] text-black border-2 border-black flex items-center gap-1 font-mono"
            }
          >
            <Image src="/images/mutable-token.png" alt="MUTB" width={16} height={16} className="rounded-full" />
            {mutbBalance.toFixed(2)} MUTB
          </Badge>
        </div>
        <CardDescription className={isCyberpunk ? "text-[#0ff]/70" : ""}>
          Select a game to play and wager MUTB tokens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game) =>
            isCyberpunk ? (
              <CyberGameCard key={game.id}>
                <div className="relative">
                  <Image
                    src={getGameImage(game) || "/placeholder.svg"}
                    alt={game.name}
                    width={400}
                    height={240}
                    className="w-full h-32 object-cover game-image"
                  />
                  {game.status === "coming-soon" && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <CyberBadge>{game.id === "pixel-pool" ? "IN DEVELOPMENT" : "COMING SOON"}</CyberBadge>
                    </div>
                  )}
                </div>
                <CardHeader className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#0a0a24] p-1 rounded-md border border-[#0ff]/50 text-[#0ff]">{game.icon}</div>
                    <CardTitle className="text-base font-mono">{game.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex-grow">
                  <p className="text-sm text-[#0ff]/70">{game.description}</p>
                  <div className="mt-2 text-xs flex items-center gap-1 text-[#0ff]/80">
                    <span className="font-medium">Min Wager:</span>
                    <div className="flex items-center">
                      <Image src="/images/mutable-token.png" alt="MUTB" width={12} height={12} />
                      <span>{game.minWager} MUTB</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 mt-auto">
                  <CyberPlayButton
                    className="w-full cyber-play-button"
                    disabled={game.status !== "live"}
                    onClick={() => handleGameSelect(game.id)}
                  >
                    {game.status === "live" ? "PLAY NOW" : "COMING SOON"}
                  </CyberPlayButton>
                </CardFooter>
              </CyberGameCard>
            ) : (
              <Card
                key={game.id}
                className={`border-2 ${game.status === "live" ? "border-black" : "border-gray-300"} overflow-hidden flex flex-col h-full`}
              >
                <div className="relative">
                  <Image
                    src={getGameImage(game) || "/placeholder.svg"}
                    alt={game.name}
                    width={400}
                    height={240}
                    className="w-full h-32 object-cover"
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
                    <CardTitle className="text-base font-mono">{game.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex-grow">
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                  <div className="mt-2 text-xs flex items-center gap-1">
                    <span className="font-medium">Min Wager:</span>
                    <div className="flex items-center">
                      <Image src="/images/mutable-token.png" alt="MUTB" width={12} height={12} />
                      <span>{game.minWager} MUTB</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 mt-auto">
                  <SoundButton
                    className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                    disabled={game.status !== "live"}
                    onClick={() => handleGameSelect(game.id)}
                  >
                    {game.status === "live" ? "PLAY NOW" : "COMING SOON"}
                  </SoundButton>
                </CardFooter>
              </Card>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { GameSelection }
