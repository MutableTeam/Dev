import { gameRegistry } from "@/types/game-registry"
import TopDownShooterGame from "./top-down-shooter"
import PixelPoolGame from "./pixel-pool"

// Register all games
export function registerGames() {
  // Register the top-down shooter game
  gameRegistry.registerGame(TopDownShooterGame)

  // Register the pixel pool game
  gameRegistry.registerGame(PixelPoolGame)

  // Register more games here as they are developed
}

// Initialize the registry
registerGames()

// Export helper functions
export function getAllGames() {
  return gameRegistry.getAllGames()
}

export function getLiveGames() {
  return gameRegistry.getLiveGames()
}

export function getGameById(id: string) {
  return gameRegistry.getGame(id)
}
