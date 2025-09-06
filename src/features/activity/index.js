export const ActivityFeature = {
  key: "activities",
  initialState: () => ({
    cultivation: false,
    physique: false,
    agility: false,
    mining: false,
    adventure: false,
    cooking: false,
    sect: false,
    forging: false,
    catching: false,
    _v: 0,
  }),
  nav: {
    visible() {
      return true;
    },
  },
};
