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
  }
};

export function getManual(id){ return MANUALS[id] || null; }
export function listManuals(){ return Object.values(MANUALS); }
