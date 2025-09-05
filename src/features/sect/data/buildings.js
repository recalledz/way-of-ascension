export const SECT_BUILDINGS = {
  kitchen: {
    name: 'Kitchen',
    desc: 'Facility for preparing meals - unlocks cooking',
    icon: '🍳',
    category: 'cooking',
    unlockReq: { realm: 1, stage: 3 }, // Qi Refining 3
    maxLevel: 5,
    baseCost: { stones: 40, wood: 20 },
    costScaling: 1.8,
    effects: {
      1: { cookingUnlock: true, cookingSuccess: 0.01, cookingSpeed: 0.05, desc: 'Unlocks cooking, +1% success, +5% speed' },
      2: { cookingSuccess: 0.02, cookingSpeed: 0.10, desc: '+2% success, +10% speed' },
      3: { cookingSuccess: 0.03, cookingSpeed: 0.15, desc: '+3% success, +15% speed' },
      4: { cookingSuccess: 0.04, cookingSpeed: 0.20, desc: '+4% success, +20% speed' },
      5: { cookingSuccess: 0.05, cookingSpeed: 0.25, desc: '+5% success, +25% speed' }
    }
  },

  alchemy_lab: {
    name: 'Alchemy Laboratory',
    desc: 'Advanced facility for pill refinement - unlocks alchemy',
    icon: '🏛️',
    category: 'alchemy',
    unlockReq: { realm: 1, stage: 5 }, // Qi Refining 5
    maxLevel: 4,
    baseCost: { stones: 100, ore: 40, wood: 60, herbs: 30 },
    costScaling: 2.0,
    effects: {
      1: { alchemyUnlock: true, alchemySlots: 1, alchemySuccess: 0.15, desc: 'Unlocks alchemy, +1 slot, +15% success' },
      2: { alchemySlots: 1, alchemySuccess: 0.30, desc: '+1 slot, +30% success' },
      3: { alchemySlots: 2, alchemySuccess: 0.50, desc: '+2 slots, +50% success' },
      4: { alchemySlots: 2, alchemySuccess: 0.75, desc: '+2 slots, +75% success' }
    }
  },

  forging_room: {
    name: 'Forging Room',
    desc: 'Workshop for imbuement and forging - unlocks forging',
    icon: '⚒️',
    category: 'forging',
    unlockReq: { realm: 2, stage: 1 }, // Foundation 1
    maxLevel: 5,
    baseCost: { stones: 120, ore: 60, wood: 80 },
    costScaling: 2.0,
    effects: {
      1: { forgingUnlock: true, imbuementSpeed: 0.05, desc: 'Unlocks forging, +5% imbuement speed' },
      2: { imbuementSpeed: 0.10, desc: '+10% imbuement speed' },
      3: { imbuementSpeed: 0.15, desc: '+15% imbuement speed' },
      4: { imbuementSpeed: 0.20, desc: '+20% imbuement speed' },
      5: { imbuementSpeed: 0.25, desc: '+25% imbuement speed' }
    }
  }
};
