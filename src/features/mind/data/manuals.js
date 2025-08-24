export const MANUALS = {
  ironBodyPrimer: {
    id: 'ironBodyPrimer',
    name: 'Iron Body Primer',
    category: 'Defense',
    // reading speed baseline; tune later
    xpRate: 0.28,
    reqLevel: 1,
    maxLevel: 3,
    // Passive defense scaling you can apply in your combat calc
    effects: [
      { hpMaxPct: 3, physDRPct: 2 },   // L1: +3% Max HP, +2% physical damage reduction
      { hpMaxPct: 3, physDRPct: 2 },   // L2: cumulative +6% HP, +4% phys DR
      { hpMaxPct: 4, physDRPct: 3 }    // L3: cumulative +10% HP, +7% phys DR
    ]
  },

  footworkFundamentals: {
    id: 'footworkFundamentals',
    name: 'Footwork Fundamentals',
    category: 'Movement',
    xpRate: 0.32,
    reqLevel: 1,
    maxLevel: 3,
    // Accuracy & dodge are already part of your combat math
    effects: [
      { accuracyPct: 3, dodgePct: 1 },  // L1
      { accuracyPct: 3, dodgePct: 1 },  // L2 → total +6% acc, +2% dodge
      { accuracyPct: 4, dodgePct: 2 }   // L3 → total +10% acc, +4% dodge
    ]
  },

  focusedChannelingI: {
    id: 'focusedChannelingI',
    name: 'Focused Channeling I',
    category: 'Casting',
    xpRate: 0.30,
    reqLevel: 1,
    maxLevel: 3,
    // Works with your existing attackRate / qi cost notions
    effects: [
      { attackRatePct: 3, qiCostPct: -3 },  // L1: +3% attack/cast rate, -3% Qi costs
      { attackRatePct: 3, qiCostPct: -3 },  // L2 → total +6% rate, -6% cost
      { attackRatePct: 4, qiCostPct: -4 }   // L3 → total +10% rate, -10% cost
    ]
  },

  qiWellspringBasics: {
    id: 'qiWellspringBasics',
    name: 'Qi Wellspring Basics',
    category: 'Qi',
    xpRate: 0.31,
    reqLevel: 1,
    maxLevel: 3,
    // Multiplies Max Qi and Qi regen
    effects: [
      { qiMaxPct: 5, qiRegenPct: 5 },  // L1
      { qiMaxPct: 5, qiRegenPct: 5 },  // L2 → total +10% Max Qi, +10% regen
      { qiMaxPct: 7, qiRegenPct: 8 }   // L3 → total +17% Max Qi, +18% regen
    ]
  },

  foundationSittingDrills: {
    id: 'foundationSittingDrills',
    name: 'Foundation Sitting Drills',
    category: 'Cultivation',
    xpRate: 0.30,
    reqLevel: 1,
    maxLevel: 3,
    // Boosts Foundation gain rate
    effects: [
      { foundationGainPct: 6 },        // L1
      { foundationGainPct: 6 },        // L2 → total +12%
      { foundationGainPct: 8 }         // L3 → total +20%
    ]
  },

  mentalDisciplineI: {
    id: 'mentalDisciplineI',
    name: 'Mental Discipline I',
    category: 'Mind',
    xpRate: 0.33,
    reqLevel: 1,
    maxLevel: 3,
    // Global Mind XP boost (reading, proficiency, crafting)
    effects: [
      { mindXpGainPct: 5 },            // L1
      { mindXpGainPct: 5 },            // L2 → total +10%
      { mindXpGainPct: 7 }             // L3 → total +17%
    ]
  },

  bodyConditioningNotes: {
    id: 'bodyConditioningNotes',
    name: 'Body Conditioning Notes',
    category: 'Physique',
    xpRate: 0.29,
    reqLevel: 1,
    maxLevel: 3,
    // Boosts Physique XP gains
    effects: [
      { physiqueXpGainPct: 5 },        // L1
      { physiqueXpGainPct: 5 },        // L2 → total +10%
      { physiqueXpGainPct: 10 }        // L3 → total +20%
    ]
  },

  ironFistTreatiseI: {
    id: 'ironFistTreatiseI',
    name: 'Iron Fist Treatise I',
    category: 'Combat',
    xpRate: 0.32,
    reqLevel: 1,
    maxLevel: 3,
    // Big fist damage per level and fist proficiency gain
    effects: [
      { fistDamagePct: 15, fistProficiencyXpPct: 10 },  // L1
      { fistDamagePct: 15, fistProficiencyXpPct: 10 },  // L2 → total +30% dmg, +20% prof XP
      { fistDamagePct: 15, fistProficiencyXpPct: 10 }   // L3 → total +45% dmg, +30% prof XP
    ]
  },

  wardShieldBasics: {
    id: 'wardShieldBasics',
    name: 'Ward Shield Basics',
    category: 'Defense',
    xpRate: 0.30,
    reqLevel: 1,
    maxLevel: 3,
    // Increases Qi Shield capacity (pair later with your shield calc)
    effects: [
      { qiShieldCapacityPct: 10 },     // L1
      { qiShieldCapacityPct: 10 },     // L2 → total +20%
      { qiShieldCapacityPct: 15 }      // L3 → total +35%
    ]
  }
};

export function getManual(id){ return MANUALS[id] || null; }
export function listManuals(){ return Object.values(MANUALS); }
