import { abilityState } from "./state.js";

export const AbilityFeature = {
  key: "ability",
  initialState: () => ({ ...abilityState, _v: 0 }),
  nav: {
    visible() {
      return true;
    },
  },
};
