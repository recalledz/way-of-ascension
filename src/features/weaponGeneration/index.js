import { weaponGenerationState } from "./state.js";

export const WeaponGenerationFeature = {
  key: "weaponGen",
  initialState: () => ({ ...weaponGenerationState, _v: 0 }),
  nav: {
    visible() {
      return true;
    },
  },
};
