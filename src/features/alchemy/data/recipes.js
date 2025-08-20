export const RECIPES = {
  qi: {
    key: 'qi',
    name: 'Qi Condensing Pill',
    cost: { herbs: 20, ore: 5 },
    time: 30,
    base: 0.8,
    give: s => {
      if (!s.pills) s.pills = {};
      s.pills.qi = (s.pills.qi || 0) + 1;
      if (s.alchemy) s.alchemy.xp += 5;
    },
    unlockHint: 'Basic alchemy knowledge',
  },
  body: {
    key: 'body',
    name: 'Body Tempering Pill',
    cost: { herbs: 10, ore: 20, wood: 10 },
    time: 45,
    base: 0.7,
    give: s => {
      if (!s.pills) s.pills = {};
      s.pills.body = (s.pills.body || 0) + 1;
      if (s.alchemy) s.alchemy.xp += 7;
    },
    unlockHint: 'Found in ancient texts or learned from masters',
  },
  ward: {
    key: 'ward',
    name: 'Tribulation Ward Pill',
    cost: { herbs: 50, ore: 25, wood: 25 },
    time: 120,
    base: 0.6,
    give: s => {
      if (!s.pills) s.pills = {};
      s.pills.ward = (s.pills.ward || 0) + 1;
      if (s.alchemy) s.alchemy.xp += 12;
    },
    unlockHint: 'Advanced recipe requiring deep cultivation knowledge',
  },
};
