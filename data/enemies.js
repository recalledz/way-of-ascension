// Enemy data for adventure zones
export const ENEMY_DATA = {
  'Forest Rabbit': { 
    name: 'Forest Rabbit', 
    hp: 15, 
    attack: 3, 
    attackRate: 1.2, 
    loot: { stones: 2, herbs: 1 } 
  },
  'Wild Boar': { 
    name: 'Wild Boar', 
    hp: 25, 
    attack: 5, 
    attackRate: 0.9, 
    loot: { stones: 4, ore: 1 } 
  },
  'River Frog': { 
    name: 'River Frog', 
    hp: 20, 
    attack: 4, 
    attackRate: 1.1, 
    loot: { stones: 3, herbs: 1 } 
  },
  'Honey Bee': { 
    name: 'Honey Bee', 
    hp: 12, 
    attack: 5, 
    attackRate: 1.5, 
    loot: { herbs: 2 },
    drops: { honey: 0.3 }
  },
  'Tree Sprite': { 
    name: 'Tree Sprite', 
    hp: 30, 
    attack: 6, 
    attackRate: 1.0, 
    loot: { herbs: 3, wood: 1 } 
  },
  'Stone Lizard': { 
    name: 'Stone Lizard', 
    hp: 40, 
    attack: 7, 
    attackRate: 0.8, 
    loot: { stones: 5, ore: 2 } 
  },
  'Water Snake': { 
    name: 'Water Snake', 
    hp: 28, 
    attack: 8, 
    attackRate: 1.2, 
    loot: { herbs: 2, venom: 1 } 
  },
  'Grass Wolf': { 
    name: 'Grass Wolf', 
    hp: 50, 
    attack: 10, 
    attackRate: 1.0, 
    loot: { meat: 2, pelt: 1 },
    drops: { meat: 0.8 }
  },
  'Ruin Guardian': { 
    name: 'Ruin Guardian', 
    hp: 80, 
    attack: 15, 
    attackRate: 0.7, 
    loot: { ore: 3, ancientRelic: 1 } 
  },
  'Forest Spirit': { 
    name: 'Forest Spirit', 
    hp: 120, 
    attack: 20, 
    attackRate: 0.9, 
    loot: { herbs: 5, ancientRelic: 2, spiritEssence: 1 } 
  },
  'Shadow Wolf': { 
    name: 'Shadow Wolf', 
    hp: 150, 
    attack: 25, 
    attackRate: 1.2, 
    loot: { shadowEssence: 1, pelt: 2 },
    drops: { meat: 0.8 }
  },
  'Dark Treant': { 
    name: 'Dark Treant', 
    hp: 250, 
    attack: 35, 
    attackRate: 0.8, 
    loot: { corruptedWood: 2, shadowEssence: 2 } 
  },
  'Cursed Toad': { 
    name: 'Cursed Toad', 
    hp: 180, 
    attack: 40, 
    attackRate: 1.1, 
    loot: { venom: 3, shadowEssence: 1 } 
  },
  'Thorn Beast': { 
    name: 'Thorn Beast', 
    hp: 300, 
    attack: 45, 
    attackRate: 0.9, 
    loot: { thorns: 4, shadowEssence: 2 } 
  },
  'Corrupted Familiar': { 
    name: 'Corrupted Familiar', 
    hp: 220, 
    attack: 50, 
    attackRate: 1.3, 
    loot: { shadowEssence: 3, arcaneDust: 2 } 
  },
  'Wraith': { 
    name: 'Wraith', 
    hp: 350, 
    attack: 55, 
    attackRate: 1.0, 
    loot: { ectoplasm: 3, shadowEssence: 3 } 
  },
  'Nightmare Hound': { 
    name: 'Nightmare Hound', 
    hp: 400, 
    attack: 65, 
    attackRate: 1.2, 
    loot: { nightmareEssence: 2, shadowEssence: 3 } 
  },
  'Skeleton Warrior': { 
    name: 'Skeleton Warrior', 
    hp: 500, 
    attack: 70, 
    attackRate: 0.9, 
    loot: { ancientBones: 4, shadowEssence: 3 } 
  },
  'Dark Cultist': { 
    name: 'Dark Cultist', 
    hp: 450, 
    attack: 80, 
    attackRate: 1.1, 
    loot: { shadowEssence: 5, arcaneTome: 1 } 
  },
  'Shadow Lord': { 
    name: 'Shadow Lord', 
    hp: 1000, 
    attack: 100, 
    attackRate: 1.5, 
    loot: { shadowEssence: 10, darkCrystal: 1, ancientRelic: 5 } 
  },
  'Mountain Goat': { 
    name: 'Mountain Goat', 
    hp: 800, 
    attack: 90, 
    attackRate: 1.3, 
    loot: { mountainHerbs: 3, goatHorn: 2 },
    drops: { meat: 1.0 }
  },
  'Wind Elemental': { 
    name: 'Wind Elemental', 
    hp: 600, 
    attack: 110, 
    attackRate: 1.8, 
    loot: { windCrystal: 3, essenceOfAir: 2 } 
  },
  'Frost Bear': { 
    name: 'Frost Bear', 
    hp: 1200, 
    attack: 130, 
    attackRate: 0.9, 
    loot: { frostFur: 4, bearClaw: 2 },
    drops: { meat: 1.2 }
  },
  'Crystal Golem': { 
    name: 'Crystal Golem', 
    hp: 2000, 
    attack: 150, 
    attackRate: 0.7, 
    loot: { crystalShards: 5, earthEssence: 3 } 
  },
  'Giant Eagle': { 
    name: 'Giant Eagle', 
    hp: 900, 
    attack: 140, 
    attackRate: 1.5, 
    loot: { eagleFeather: 3, talon: 2 } 
  },
  'Lightning Hawk': { 
    name: 'Lightning Hawk', 
    hp: 700, 
    attack: 160, 
    attackRate: 2.0, 
    loot: { lightningFeather: 4, stormEssence: 3 } 
  },
  'Ice Titan': { 
    name: 'Ice Titan', 
    hp: 3000, 
    attack: 200, 
    attackRate: 0.8, 
    loot: { titanIce: 5, frozenCore: 1 } 
  },
  'Young Dragon': { 
    name: 'Young Dragon', 
    hp: 5000, 
    attack: 250, 
    attackRate: 1.2, 
    loot: { dragonScales: 5, dragonClaw: 3, dragonBlood: 2 } 
  },
  'Sky Guardian': { 
    name: 'Sky Guardian', 
    hp: 4000, 
    attack: 300, 
    attackRate: 1.5, 
    loot: { guardianFeather: 5, skyEssence: 3, ancientRelic: 5 } 
  },
  'Mountain King': { 
    name: 'Mountain King', 
    hp: 10000, 
    attack: 400, 
    attackRate: 1.0, 
    loot: { kingsCrown: 1, mountainHeart: 1, ancientRelic: 10 } 
  }
};
