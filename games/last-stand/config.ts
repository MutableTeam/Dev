// Game configuration for Last Stand
export const gameConfig = {
  id: "last-stand",
  name: "Last Stand",
  description: "Defend against waves of enemies with your bow and arrow",
  version: "1.0.0",
  thumbnail: "/images/last-stand.jpg",
  status: "live", // Make sure this is set to "live"
  minWager: 0, // Free to play in practice mode
  modes: [
    {
      id: "solo",
      name: "Solo",
      description: "Single player mode",
      minPlayers: 1,
      maxPlayers: 1,
    },
    {
      id: "practice",
      name: "Practice",
      description: "Practice mode with no stakes",
      minPlayers: 1,
      maxPlayers: 1,
      isPractice: true,
    },
  ],
  defaultMode: "solo",
  features: {
    specialAttacks: true,
    powerUps: true,
    waveProgression: true,
  },
  difficulty: {
    easy: {
      enemySpeed: 0.8,
      enemySpawnRate: 1.5,
      playerDamage: 0.8,
    },
    normal: {
      enemySpeed: 1.0,
      enemySpawnRate: 1.0,
      playerDamage: 1.0,
    },
    hard: {
      enemySpeed: 1.2,
      enemySpawnRate: 0.8,
      playerDamage: 1.2,
    },
  },
  defaultDifficulty: "normal",
  controls: {
    keyboard: {
      movement: "WASD or Arrow Keys",
      attack: "Space or Left Mouse Button",
      specialAttack: "E Key",
      dash: "Shift Key",
    },
    touch: {
      movement: "Virtual Joystick (Left)",
      attack: "Attack Button (Right)",
      specialAttack: "Special Button (Right)",
      dash: "Dash Button (Right)",
    },
  },
}
