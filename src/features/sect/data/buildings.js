export const SECT_BUILDINGS = {
  // Basic Infrastructure (Unlocked from start)
  meditation_mat: {
    name: 'Meditation Mat',
    desc: 'A simple mat for focused cultivation',
    icon: '🧘',
    category: 'cultivation',
    unlockReq: {realm: 0, stage: 1}, // Mortal 1
    maxLevel: 5,
    baseCost: {stones: 20},
    costScaling: 1.8,
    effects: {
      1: {qiRegenMult: 0.15, foundationMult: 0.20, desc: '+15% Qi regen, +20% foundation gain'},
      2: {qiRegenMult: 0.30, foundationMult: 0.40, desc: '+30% Qi regen, +40% foundation gain'},
      3: {qiRegenMult: 0.50, foundationMult: 0.65, desc: '+50% Qi regen, +65% foundation gain'},
      4: {qiRegenMult: 0.75, foundationMult: 0.95, desc: '+75% Qi regen, +95% foundation gain'},
      5: {qiRegenMult: 1.00, foundationMult: 1.30, desc: '+100% Qi regen, +130% foundation gain'}
    }
  },

  spirit_well: {
    name: 'Spirit Well',
    desc: 'A well that gathers spiritual energy',
    icon: '🏺',
    category: 'cultivation',
    unlockReq: {realm: 1, stage: 3}, // Qi Refining 3
    maxLevel: 4,
    baseCost: {stones: 50, wood: 20},
    costScaling: 2.0,
    effects: {
      1: {qiCapMult: 0.25, desc: '+25% Qi capacity'},
      2: {qiCapMult: 0.50, desc: '+50% Qi capacity'},
      3: {qiCapMult: 0.80, desc: '+80% Qi capacity'},
      4: {qiCapMult: 1.20, desc: '+120% Qi capacity'}
    }
  },

  // Resource Buildings
  herbal_garden: {
    name: 'Herbal Garden',
    desc: 'Cultivated plots for growing spiritual herbs',
    icon: '🌿',
    category: 'resources',
    unlockReq: {realm: 1, stage: 5}, // Qi Refining 5
    maxLevel: 6,
    baseCost: {stones: 40, wood: 25},
    costScaling: 1.9,
    effects: {
      1: {herbYield: 0.30, desc: '+30% herb yield'},
      2: {herbYield: 0.60, desc: '+60% herb yield'},
      3: {herbYield: 1.00, desc: '+100% herb yield'},
      4: {herbYield: 1.50, desc: '+150% herb yield'},
      5: {herbYield: 2.10, desc: '+210% herb yield'},
      6: {herbYield: 3.00, desc: '+300% herb yield'}
    }
  },

  spirit_mine: {
    name: 'Spirit Mine',
    desc: 'Deep shafts that extract spiritual ores',
    icon: '⛏️',
    category: 'resources',
    unlockReq: {realm: 2, stage: 1}, // Foundation 1
    maxLevel: 5,
    baseCost: {stones: 80, ore: 15},
    costScaling: 2.1,
    effects: {
      1: {oreYield: 0.40, desc: '+40% ore yield'},
      2: {oreYield: 0.85, desc: '+85% ore yield'},
      3: {oreYield: 1.40, desc: '+140% ore yield'},
      4: {oreYield: 2.10, desc: '+210% ore yield'},
      5: {oreYield: 3.00, desc: '+300% ore yield'}
    }
  },

  sacred_grove: {
    name: 'Sacred Grove',
    desc: 'Ancient trees imbued with spiritual energy',
    icon: '🌳',
    category: 'resources',
    unlockReq: {realm: 2, stage: 3}, // Foundation 3
    maxLevel: 5,
    baseCost: {stones: 100, wood: 50, herbs: 20},
    costScaling: 2.0,
    effects: {
      1: {woodYield: 0.50, desc: '+50% wood yield'},
      2: {woodYield: 1.00, desc: '+100% wood yield'},
      3: {woodYield: 1.70, desc: '+170% wood yield'},
      4: {woodYield: 2.50, desc: '+250% wood yield'},
      5: {woodYield: 3.50, desc: '+350% wood yield'}
    }
  },

  // Advanced Buildings
  alchemy_lab: {
    name: 'Alchemy Laboratory',
    desc: 'Advanced facility for pill refinement - unlocks alchemy',
    icon: '🏛️',
    category: 'alchemy',
    unlockReq: {realm: 1, stage: 5}, // Qi Refining 5 - earlier unlock
    maxLevel: 4,
    baseCost: {stones: 100, ore: 40, wood: 60, herbs: 30}, // Reduced cost
    costScaling: 2.0, // Reduced scaling
    effects: {
      1: {alchemyUnlock: true, alchemySlots: 1, alchemySuccess: 0.15, desc: 'Unlocks alchemy, +1 slot, +15% success'},
      2: {alchemySlots: 1, alchemySuccess: 0.30, desc: '+1 slot, +30% success'},
      3: {alchemySlots: 2, alchemySuccess: 0.50, desc: '+2 slots, +50% success'},
      4: {alchemySlots: 2, alchemySuccess: 0.75, desc: '+2 slots, +75% success'}
    }
  },

  training_grounds: {
    name: 'Training Grounds',
    desc: 'Facilities for combat training and sparring',
    icon: '⚔️',
    category: 'combat',
    unlockReq: {realm: 2, stage: 7}, // Foundation 7
    maxLevel: 5,
    baseCost: {stones: 200, ore: 80, wood: 60},
    costScaling: 2.2,
    effects: {
      1: {atkBase: 3, armorBase: 2, desc: '+3 ATK, +2 Armor'},
      2: {atkBase: 6, armorBase: 4, desc: '+6 ATK, +4 Armor'},
      3: {atkBase: 10, armorBase: 7, desc: '+10 ATK, +7 Armor'},
      4: {atkBase: 15, armorBase: 11, desc: '+15 ATK, +11 Armor'},
      5: {atkBase: 22, armorBase: 16, desc: '+22 ATK, +16 Armor'}
    }
  },

  disciple_quarters: {
    name: 'Disciple Quarters',
    desc: 'Housing for sect disciples',
    icon: '🏠',
    category: 'disciples',
    unlockReq: {realm: 3, stage: 1}, // Core 1
    maxLevel: 6,
    baseCost: {stones: 120, wood: 100},
    costScaling: 1.7,
    effects: {
      1: {disciples: 1, desc: '+1 disciple'},
      2: {disciples: 2, desc: '+2 disciples'},
      3: {disciples: 3, desc: '+3 disciples'},
      4: {disciples: 4, desc: '+4 disciples'},
      5: {disciples: 6, desc: '+6 disciples'},
      6: {disciples: 8, desc: '+8 disciples'}
    }
  },

  // Elite Buildings (High-tier unlocks)
  grand_library: {
    name: 'Grand Library',
    desc: 'Repository of ancient cultivation knowledge',
    icon: '📚',
    category: 'knowledge',
    unlockReq: {realm: 3, stage: 5}, // Core 5
    maxLevel: 3,
    baseCost: {stones: 500, wood: 300, herbs: 100, cores: 10},
    costScaling: 2.5,
    effects: {
      1: {lawPoints: 5, qiRegenMult: 0.25, desc: '+5 law points, +25% Qi regen'},
      2: {lawPoints: 10, qiRegenMult: 0.50, desc: '+10 law points, +50% Qi regen'},
      3: {lawPoints: 20, qiRegenMult: 1.00, desc: '+20 law points, +100% Qi regen'}
    }
  },

  celestial_observatory: {
    name: 'Celestial Observatory',
    desc: 'Tower for studying heavenly phenomena',
    icon: '🔭',
    category: 'advanced',
    unlockReq: {realm: 4, stage: 1}, // Nascent 1
    maxLevel: 2,
    baseCost: {stones: 800, ore: 400, wood: 300, herbs: 200, cores: 25},
    costScaling: 3.0,
    effects: {
      1: {breakthroughBonus: 0.20, lawPoints: 10, desc: '+20% breakthrough chance, +10 law points'},
      2: {breakthroughBonus: 0.40, lawPoints: 25, desc: '+40% breakthrough chance, +25 law points'}
    }
  }
};

