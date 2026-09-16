// Behavioral constants recovered from LAB25Q. Migration must preserve behavior unless explicitly retuned.
export const GAMEPLAY_CONFIG = {
  characterX: 220,
  worldSpeed: 120,
  masterScale: { claude: 0.185, constance: 0.179 },
  actions: { slideDuration: 0.75 }, // Legacy LAB25Q value; locked production spec remains 0.70s and will be reconciled explicitly.
  hitRecovery: { recoveryDuration: 1.10, invulnerabilityDuration: 2.00, showStars: true },
  spawnDirector: {
    enabled: false,
    paused: false,
    unlimitedLives: false,
    stageDuration: 90,
    startingLives: 3,
    lives: 3,
    finishRelease: 5,
    maxVisible: 2,
    reactionLead: 2.20,
    spawnLeadX: 1080,
    signatureStart: 75,
    seed: 2309,
    speedClasses: { slow: 150, normal: 170, fast: 210 },
    altitudeMix: { high: 55, low: 45 },
    phases: { warmup:[0,10], establish:[10,30], develop:[30,55], pressure:[55,75], signature:[75,85], finish:[85,90] }
  },
  flying: { highClearance: 68, lowClearance: 18, speed: 170, fps: 8 }
};
