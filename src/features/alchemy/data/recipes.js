export const ALCHEMY_RECIPES = {
  qi: {
    key: 'qi',
    name: 'Qi Condensing Pill',
    type: 'temporary',
    lineKey: 'qi',
    tiers: {
      1: {
        inputs: { herbs: 5 },
        qiCost: 0,
        baseTime: 30,
        skillReq: { alchemy: 1 },
        buildingReq: { cauldron: 1 },
      }
    },
    effects: { qiRestorePct: 25 },
    coalesce: { ratio: 3, baseCoalesceTime: 30, timeMultiplierPerTier: 1.5 }
  },
  body: {
    key: 'body',
    name: 'Body Tempering Pill',
    type: 'temporary',
    lineKey: 'body',
    exclusivityGroup: 'body',
    tiers: {
      1: {
        inputs: { herbs: 8 },
        qiCost: 10,
        baseTime: 45,
        skillReq: { alchemy: 1 },
        buildingReq: { cauldron: 1 },
      }
    },
    effects: { status: 'pill_body_t1' },
    coalesce: { ratio: 3, baseCoalesceTime: 45, timeMultiplierPerTier: 1.5 }
  },
  ward: {
    key: 'ward',
    name: 'Breakthrough Ward Pill',
    type: 'temporary',
    lineKey: 'ward',
    exclusivityGroup: 'breakthrough',
    tiers: {
      1: {
        inputs: { herbs: 6, spirit_stone: 20 },
        qiCost: 15,
        baseTime: 50,
        skillReq: { alchemy: 1 },
        buildingReq: { cauldron: 1 },
      }
    },
    effects: { status: 'pill_breakthrough_t1' },
    coalesce: { ratio: 3, baseCoalesceTime: 50, timeMultiplierPerTier: 1.5 }
  },
  meridian_opening_dan: {
    key: 'meridian_opening_dan',
    name: 'Meridian-Opening Dan',
    type: 'temporary',
    lineKey: 'meridian_opening_dan',
    exclusivityGroup: 'breakthrough',
    tiers: {
      1: {
        inputs: { spirit_stone: 100, basic_core: 10 },
        qiCost: 20,
        baseTime: 40,
        skillReq: { alchemy: 1 },
        buildingReq: { cauldron: 1 },
      }
    },
    effects: { status: 'pill_meridian_opening_t1' },
    coalesce: { ratio: 3, baseCoalesceTime: 60, timeMultiplierPerTier: 1.5 }
  },
  insight: {
    key: 'insight',
    name: 'Insight Pill',
    type: 'permanent',
    lineKey: 'insight',
    tiers: {
      1: {
        inputs: { aromaticHerb: 5, basic_core: 5 },
        qiCost: 0,
        baseTime: 60,
        skillReq: { alchemy: 1 },
        buildingReq: { cauldron: 1 },
      }
    },
    effects: { stats: { mind: 1 } },
    coalesce: { ratio: 3, baseCoalesceTime: 90, timeMultiplierPerTier: 2 },
    resistance: { baseRp: 1, tierWeight: 1, rpCap: 10 }
  }
};
