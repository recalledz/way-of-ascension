export const MANUALS = {
  ironBodyPrimer: {
    id: 'ironBodyPrimer',
    name: 'Iron Body Primer',
    category: 'Defense',
    xpRate: 0.28,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 15 * 60,
    statWeights: { mind: 0.6, agility: 0.3, physique: 1.0 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { hpMaxPct: 5, armorPct: 4 },
      { hpMaxPct: 5, armorPct: 4 },
      { hpMaxPct: 6, armorPct: 6 },
      { hpMaxPct: 8, armorPct: 8 },
      { hpMaxPct: 10, armorPct: 12 }
    ]
  },

  footworkFundamentals: {
    id: 'footworkFundamentals',
    name: 'Footwork Fundamentals',
    category: 'Agility',
    xpRate: 0.32,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 12 * 60,
    statWeights: { mind: 0.7, agility: 0.9, physique: 0.4 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { accuracyPct: 5, dodgePct: 2 },
      { accuracyPct: 5, dodgePct: 2 },
      { accuracyPct: 7, dodgePct: 3 },
      { accuracyPct: 9, dodgePct: 4 },
      { accuracyPct: 12, dodgePct: 5 }
    ]
  },

  focusedChannelingI: {
    id: 'focusedChannelingI',
    name: 'Focused Channeling I',
    category: 'Spells',
    xpRate: 0.30,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 14 * 60,
    statWeights: { mind: 0.8, agility: 0.5, physique: 0.4 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { attackRatePct: 5, qiCostPct: -5 },
      { attackRatePct: 5, qiCostPct: -5 },
      { attackRatePct: 7, qiCostPct: -7 },
      { attackRatePct: 9, qiCostPct: -8 },
      { attackRatePct: 12, qiCostPct: -10 }
    ]
  },

  qiWellspringBasics: {
    id: 'qiWellspringBasics',
    name: 'Qi Wellspring Basics',
    category: 'Qi',
    xpRate: 0.31,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 16 * 60,
    statWeights: { mind: 0.9, agility: 0.3, physique: 0.3 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { qiMaxPct: 7, qiRegenPct: 7, unlockRecipe: 'qi' },
      { qiMaxPct: 7, qiRegenPct: 7 },
      { qiMaxPct: 9, qiRegenPct: 10 },
      { qiMaxPct: 12, qiRegenPct: 12 },
      { qiMaxPct: 15, qiRegenPct: 15 }
    ]
  },

  foundationSittingDrills: {
    id: 'foundationSittingDrills',
    name: 'Foundation Sitting Drills',
    category: 'Cultivation',
    xpRate: 0.30,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 20 * 60,
    statWeights: { mind: 0.9, physique: 0.4 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { foundationGainPct: 6, unlockRecipe: 'ward' },
      { foundationGainPct: 6 },
      { foundationGainPct: 8 },
      { foundationGainPct: 10 },
      { foundationGainPct: 12 }
    ]
  },

  mentalDisciplineI: {
    id: 'mentalDisciplineI',
    name: 'Mental Discipline I',
    category: 'Mind',
    xpRate: 0.33,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 18 * 60,
    statWeights: { mind: 1.0, agility: 0.2 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { mindXpGainPct: 5 },
      { mindXpGainPct: 5 },
      { mindXpGainPct: 7 },
      { mindXpGainPct: 8 },
      { mindXpGainPct: 10 }
    ]
  },

  bodyConditioningNotes: {
    id: 'bodyConditioningNotes',
    name: 'Body Conditioning Notes',
    category: 'Physique',
    xpRate: 0.29,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 12 * 60,
    statWeights: { mind: 0.6, physique: 1.0 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { physiqueXpGainPct: 7, unlockRecipe: 'body' },
      { physiqueXpGainPct: 7 },
      { physiqueXpGainPct: 12 },
      { physiqueXpGainPct: 12 },
      { physiqueXpGainPct: 18 }
    ]
  },

  ironFistTreatiseI: {
    id: 'ironFistTreatiseI',
    name: 'Iron Fist Treatise I',
    category: 'Physique',
    xpRate: 0.32,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 24 * 60,
    statWeights: { mind: 0.5, agility: 0.6, physique: 1.0 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { fistDamagePct: 15, fistProficiencyXpPct: 12 },
      { fistDamagePct: 15, fistProficiencyXpPct: 12 },
      { fistDamagePct: 20, fistProficiencyXpPct: 15 },
      { fistDamagePct: 25, fistProficiencyXpPct: 18 },
      { fistDamagePct: 30, fistProficiencyXpPct: 22 }
    ]
  },

  wardShieldBasics: {
    id: 'wardShieldBasics',
    name: 'Ward Shield Basics',
    category: 'Defense',
    xpRate: 0.30,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 14 * 60,
    statWeights: { mind: 0.8, physique: 0.5 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    effects: [
      { qiShieldCapacityPct: 12 },
      { qiShieldCapacityPct: 12 },
      { qiShieldCapacityPct: 18 },
      { qiShieldCapacityPct: 24 },
      { qiShieldCapacityPct: 30 }
    ]
  },

  flowingPalmManual: {
    id: 'flowingPalmManual',
    name: 'Flowing Palm Manual',
    category: 'Agility',
    xpRate: 0.31,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 15 * 60,
    statWeights: { mind: 0.7, agility: 0.6, physique: 0.4 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    grantsAbility: 'flowingPalm',
    effects: [
      { abilityMods: { flowingPalm: { damagePct: 8, stunPct: 20 } } },
      { abilityMods: { flowingPalm: { damagePct: 8, stunPct: 20 } } },
      { abilityMods: { flowingPalm: { damagePct: 10, stunPct: 25 } } },
      { abilityMods: { flowingPalm: { damagePct: 12, stunPct: 30 } } },
      { abilityMods: { flowingPalm: { damagePct: 15, stunPct: 40 } } },
    ]
  },

  fireballManual: {
    id: 'fireballManual',
    name: 'Fireball Manual',
    category: 'Spells',
    xpRate: 0.32,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 15 * 60,
    statWeights: { mind: 0.9, agility: 0.6, physique: 0.3 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    grantsAbility: 'fireball',
    effects: [
      { unlockAbility: 'fireball', abilityMods: { fireball: { damagePct: 10, castTimePct: -5 } } },
      { abilityMods: { fireball: { damagePct: 10, castTimePct: -5 } } },
      { abilityMods: { fireball: { damagePct: 13, castTimePct: -7 } } },
      { abilityMods: { fireball: { damagePct: 16, castTimePct: -9 } } },
      { abilityMods: { fireball: { damagePct: 20, castTimePct: -12 } } },
    ]
  },

  lightningStepManual: {
    id: 'lightningStepManual',
    name: 'Lightning Step Manual',
    category: 'Agility',
    xpRate: 0.33,
    reqLevel: 1,
    maxLevel: 5,
    baseTimeSec: 15 * 60,
    statWeights: { mind: 0.7, agility: 0.7, physique: 0.4 },
    maxSpeedBoostPct: 400,
    levelTimeMult: [1, 6, 30, 180, 1800],
    grantsAbility: 'lightningStep',
    effects: [
      { unlockAbility: 'lightningStep' },
      {},
      {},
      {},
      {}
    ]
  }
};

export function getManual(id) {
  return MANUALS[id] || null;
}

export function listManuals() {
  return Object.values(MANUALS);
}

