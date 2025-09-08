export const ALCHEMY_RECIPES = {
  qi: {
    key: 'qi',
    name: 'Qi Condensing Pill',
    time: 30,
    base: 0.8,
    xp: 5,
    output: { itemKey: 'qi', qty: 1, tier: 1, type: 'pill' },
  },
  body: {
    key: 'body',
    name: 'Body Tempering Pill',
    time: 45,
    base: 0.7,
    xp: 7,
    output: { itemKey: 'body', qty: 1, tier: 1, type: 'pill' },
  },
  meridian_opening_dan: {
    key: 'meridian_opening_dan',
    name: 'Meridian-Opening Dan',
    time: 40,
    base: 0.75,
    qiCost: 20,
    cost: { spirit_stone: 100, basic_core: 10 },
    xp: 8,
    output: { itemKey: 'meridian_opening_dan', qty: 1, tier: 1, type: 'pill' },
  },
};
