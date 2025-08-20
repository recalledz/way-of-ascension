// Enemy data for adventure zones
export const ENEMY_DATA = {
  // === PEACEFUL FOREST (Starting Zone) ===
  // Low-level creatures for beginners
  'Forest Rabbit': { 
    name: 'Forest Rabbit', 
    hp: 45,
    attack: 3, 
    attackRate: 1.2, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { stones: 2, herbs: 1 } 
  },
  'Wild Boar': { 
    name: 'Wild Boar', 
    hp: 75,
    attack: 5, 
    attackRate: 0.9, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { stones: 4, ore: 1 } 
  },
  'River Frog': { 
    name: 'River Frog', 
    hp: 60,
    attack: 4, 
    attackRate: 1.1, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { stones: 3, herbs: 1 } 
  },
  'Honey Bee': { 
    name: 'Honey Bee', 
    hp: 36,
    attack: 5, 
    attackRate: 1.5, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { herbs: 2 },
    drops: { honey: 0.3 }
  },

  // === ENCHANTED GROVE ===
  // Magical forest creatures with nature-based loot
  'Tree Sprite': { 
    name: 'Tree Sprite', 
    hp: 90,
    attack: 6, 
    attackRate: 1.0, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { herbs: 3, wood: 1 } 
  },
  'Stone Lizard': { 
    name: 'Stone Lizard', 
    hp: 120,
    attack: 7, 
    attackRate: 0.8, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { stones: 5, ore: 2 } 
  },
  'Water Snake': { 
    name: 'Water Snake', 
    hp: 84,
    attack: 8, 
    attackRate: 1.2, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { herbs: 2, venom: 1 } 
  },
  'Grass Wolf': { 
    name: 'Grass Wolf', 
    hp: 150,
    attack: 10, 
    attackRate: 1.0, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { meat: 2, pelt: 1 },
    drops: { meat: 0.8 }
  },

  // === ANCIENT RUINS ===
  // Guardians and spirits protecting old secrets
  'Ruin Guardian': { 
    name: 'Ruin Guardian', 
    hp: 240,
    attack: 15, 
    attackRate: 0.7, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { ore: 3, ancientRelic: 1 } 
  },
  'Forest Spirit': { 
    name: 'Forest Spirit', 
    hp: 360,
    attack: 20, 
    attackRate: 0.9, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { herbs: 5, ancientRelic: 2, spiritEssence: 1 } 
  },

  // === DARK FOREST ===
  // Corrupted creatures infused with shadow essence
  'Shadow Wolf': { 
    name: 'Shadow Wolf', 
    hp: 450,
    attack: 25, 
    attackRate: 1.2, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { shadowEssence: 1, pelt: 2 },
    drops: { meat: 0.8 }
  },
  'Dark Treant': { 
    name: 'Dark Treant', 
    hp: 750,
    attack: 35, 
    attackRate: 0.8, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { corruptedWood: 2, shadowEssence: 2 } 
  },
  'Cursed Toad': { 
    name: 'Cursed Toad', 
    hp: 540,
    attack: 40, 
    attackRate: 1.1, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { venom: 3, shadowEssence: 1 } 
  },
  'Thorn Beast': { 
    name: 'Thorn Beast', 
    hp: 900,
    attack: 45, 
    attackRate: 0.9, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { thorns: 4, shadowEssence: 2 } 
  },
  'Corrupted Familiar': { 
    name: 'Corrupted Familiar', 
    hp: 660,
    attack: 50, 
    attackRate: 1.3, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { shadowEssence: 3, arcaneDust: 2 } 
  },
  'Wraith': { 
    name: 'Wraith', 
    hp: 1050,
    attack: 55, 
    attackRate: 1.0, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { ectoplasm: 3, shadowEssence: 3 } 
  },
  'Nightmare Hound': { 
    name: 'Nightmare Hound', 
    hp: 1200,
    attack: 65, 
    attackRate: 1.2, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { nightmareEssence: 2, shadowEssence: 3 } 
  },
  'Skeleton Warrior': { 
    name: 'Skeleton Warrior', 
    hp: 1500,
    attack: 70, 
    attackRate: 0.9, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { ancientBones: 4, shadowEssence: 3 } 
  },
  'Dark Cultist': { 
    name: 'Dark Cultist', 
    hp: 1350,
    attack: 80, 
    attackRate: 1.1, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { shadowEssence: 5, arcaneTome: 1 } 
  },

  // === SHADOW REALM ===
  // Powerful dark entities and nightmare creatures
  'Shadow Lord': { 
    name: 'Shadow Lord', 
    hp: 3000,
    attack: 100, 
    attackRate: 1.5, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { shadowEssence: 10, darkCrystal: 1, ancientRelic: 5 } 
  },

  // === MOUNTAIN PEAKS ===
  // High-altitude creatures adapted to harsh conditions
  'Mountain Goat': { 
    name: 'Mountain Goat', 
    hp: 2400,
    attack: 90, 
    attackRate: 1.3, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { mountainHerbs: 3, goatHorn: 2 },
    drops: { meat: 1.0 }
  },
  'Wind Elemental': { 
    name: 'Wind Elemental', 
    hp: 1800,
    attack: 110, 
    attackRate: 1.8, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { windCrystal: 3, essenceOfAir: 2 } 
  },
  'Frost Bear': { 
    name: 'Frost Bear', 
    hp: 3600,
    attack: 130, 
    attackRate: 0.9, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { frostFur: 4, bearClaw: 2 },
    drops: { meat: 1.2 }
  },
  'Crystal Golem': { 
    name: 'Crystal Golem', 
    hp: 6000,
    attack: 150, 
    attackRate: 0.7, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { crystalShards: 5, earthEssence: 3 } 
  },
  'Giant Eagle': { 
    name: 'Giant Eagle', 
    hp: 2700,
    attack: 140, 
    attackRate: 1.5, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { eagleFeather: 3, talon: 2 } 
  },
  'Lightning Hawk': { 
    name: 'Lightning Hawk', 
    hp: 2100,
    attack: 160, 
    attackRate: 2.0, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { lightningFeather: 4, stormEssence: 3 } 
  },
  'Ice Titan': { 
    name: 'Ice Titan', 
    hp: 9000,
    attack: 200, 
    attackRate: 0.8, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { titanIce: 5, frozenCore: 1 } 
  },
  'Young Dragon': { 
    name: 'Young Dragon', 
    hp: 15000,
    attack: 250, 
    attackRate: 1.2, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { dragonScales: 5, dragonClaw: 3, dragonBlood: 2 } 
  },
  'Sky Guardian': { 
    name: 'Sky Guardian', 
    hp: 12000,
    attack: 300, 
    attackRate: 1.5, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { guardianFeather: 5, skyEssence: 3, ancientRelic: 5 } 
  },

  // === CELESTIAL HEIGHTS ===
  // Legendary beings that rule the highest peaks
  'Mountain King': { 
    name: 'Mountain King', 
    hp: 30000,
    attack: 400, 
    attackRate: 1.0, 
    resists: { fire: 0, water: 0, wood: 0, earth: 0, metal: 0 },
    loot: { kingsCrown: 1, mountainHeart: 1, ancientRelic: 10 } 
  }
};
