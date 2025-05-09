import { gameRegistry } from "@/types/game-registry"
import TopDownShooterGame from "./top-down-shooter"
import LastStandGame from "./last-stand"
import PixelPoolGame from "./pixel-pool"

// Clear existing games before registering to prevent duplicates
gameRegistry.clearGames()

// Register all games
export function registerGames() {
  // Register Top Down Shooter (Archer Arena)
  gameRegistry.registerGame({
    config: {
      id: "archer-arena",
      name: "Archer Arena",
      description: "A fast-paced top-down archery battle game",
      image: "/images/archer-game.png",
      iconName: "Target", // Use string identifier instead of JSX
      status: "live",
      minWager: 1,
      maxWager: 10,
      defaultWager: 1,
      category: "action",
      tags: ["archery", "battle", "pvp"],
      releaseDate: "2023-10-15",
      lastUpdated: "2023-12-01",
      version: "1.2.0",
      developer: "Mutable Games",
      publisher: "Mutable",
      platform: ["web", "mobile"],
      genre: ["action", "arcade"],
      players: "1-4",
    },
    component: TopDownShooterGame,
  })

  // Register Last Stand
  gameRegistry.registerGame({
    config: {
      id: "last-stand",
      name: "Archer Arena: Last Stand",
      description: "Fight waves of undead enemies in this survival archery game",
      image: "/images/last-stand.jpg",
      iconName: "Waves", // Use string identifier instead of JSX
      status: "live",
      minWager: 0,
      maxWager: 10,
      defaultWager: 0,
      category: "survival",
      tags: ["archery", "survival", "waves"],
      releaseDate: "2024-01-10",
      lastUpdated: "2024-02-15",
      version: "1.0.5",
      developer: "Mutable Games",
      publisher: "Mutable",
      platform: ["web"],
      genre: ["survival", "action"],
      players: "1",
    },
    component: LastStandGame,
  })

  // Register Pixel Pool (Coming Soon)
  gameRegistry.registerGame({
    config: {
      id: "pixel-pool",
      name: "Pixel Pool",
      description: "Classic 8-ball pool with pixel art graphics",
      image: "/images/pixel-art-pool.png",
      iconName: "Gamepad2", // Use string identifier instead of JSX
      status: "coming-soon",
      minWager: 5,
      maxWager: 20,
      defaultWager: 5,
      category: "sports",
      tags: ["pool", "billiards", "pixel-art"],
      releaseDate: "Coming Soon",
      developer: "Mutable Games",
      publisher: "Mutable",
      platform: ["web", "mobile"],
      genre: ["sports", "casual"],
      players: "1-2",
    },
    component: PixelPoolGame,
  })
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
