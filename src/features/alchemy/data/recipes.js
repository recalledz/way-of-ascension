export const ALCHEMY_RECIPES = {
  qi: {
    key: 'qi',
    name: 'Qi Condensing Pill',
    time: 30,
    base: 0.8,
    xp: 5,
    effect: state => {
      state.pills = state.pills || { qi: 0 };
      state.pills.qi = (state.pills.qi || 0) + 1;
    },
  },
  body: {
    key: 'body',
    name: 'Body Tempering Pill',
    time: 45,
    base: 0.7,
    xp: 7,
    effect: state => {
      state.pills = state.pills || { body: 0 };
      state.pills.body = (state.pills.body || 0) + 1;
    },
  },
};
