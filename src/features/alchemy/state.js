export const alchemyState = {
  level: 1,
  exp: 0,
  expMax: 100,
  lab: {
    baseSlots: 2,
    slots: 2,
    activeJobs: [],
    queue: [],
    paused: false,
  },
  knownRecipes: { qi: true, body: true, ward: true },
  recipeStats: {},
  outputs: {},
  resistance: {},
  settings: { qiDrainEnabled: false },
};
