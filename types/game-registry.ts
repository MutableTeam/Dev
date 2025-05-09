import type React from "react"
import type { ReactNode } from "react"

// Game status types
export type GameStatus = "live" | "coming-soon" | "maintenance"

// Game configuration interface
export interface GameConfig {
  id: string
  name: string
  description: string
  image?: string
  icon: ReactNode
  status: GameStatus
  minWager: number
  maxWager?: number
  defaultWager?: number
  category?: string
  tags?: string[]
  releaseDate?: string
  lastUpdated?: string
  version?: string
  developer?: string
  publisher?: string
  platform?: string[]
  genre?: string[]
  rating?: string
  ageRating?: string
  players?: string
  languages?: string[]
  size?: string
  requirements?: {
    os?: string[]
    processor?: string
    memory?: string
    graphics?: string
    storage?: string
    network?: string
  }
  gameType?: string
  modes?: GameMode[]
}

export interface GameMode {
  id: string
  name: string
  description: string
  players: number
  icon: ReactNode
  minWager: number
  duration?: number
  leaderboardRefresh?: "hourly" | "daily"
}

export interface GameInitParams {
  playerId: string
  playerName: string
  isHost: boolean
  gameMode: string
  players: { id: string; name: string }[]
}

// Game interface
export interface GameImplementation {
  GameComponent: React.ComponentType<any>
  InstructionsComponent: React.ComponentType<any>
  config: GameConfig
  initializeGameState: (params: GameInitParams) => any
}

export interface GameInfo {
  id: string
  name: string
  description: string
  image?: string
  icon: ReactNode
  status: GameStatus
}

// Game registry class
export class GameRegistry {
  private games: Map<string, GameImplementation> = new Map()

  // Register a game
  registerGame(game: GameImplementation): void {
    this.games.set(game.config.id, game)
  }

  // Get a game by ID
  getGame(id: string): GameImplementation | undefined {
    return this.games.get(id)
  }

  // Get all games
  getAllGames(): GameImplementation[] {
    return Array.from(this.games.values())
  }

  // Get games by status
  getGamesByStatus(status: GameStatus): GameImplementation[] {
    return this.getAllGames().filter((game) => game.config.status === status)
  }

  // Get live games
  getLiveGames(): GameImplementation[] {
    return this.getGamesByStatus("live")
  }

  // Get coming soon games
  getComingSoonGames(): GameImplementation[] {
    return this.getGamesByStatus("coming-soon")
  }

  // Get games by category
  getGamesByCategory(category: string): GameImplementation[] {
    return this.getAllGames().filter((game) => game.config.category === category)
  }

  // Get games by tag
  getGamesByTag(tag: string): GameImplementation[] {
    return this.getAllGames().filter((game) => game.config.tags?.includes(tag))
  }

  // Update game status
  updateGameStatus(id: string, status: GameStatus): void {
    const game = this.getGame(id)
    if (game) {
      game.config.status = status
    }
  }

  // Update game config
  updateGameConfig(id: string, config: Partial<GameConfig>): void {
    const game = this.getGame(id)
    if (game) {
      game.config = { ...game.config, ...config }
    }
  }

  // Clear all games
  clearGames(): void {
    this.games.clear()
  }
}

// Create and export a singleton instance
export const gameRegistry = new GameRegistry()
