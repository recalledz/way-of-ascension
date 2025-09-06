import { lootState } from "./state.js";

export const LootFeature = {
  key: "loot",
  initialState: () => ({ ...lootState, _v: 0 }),
  nav: {
    visible() {
      return true;
    },
  },
};
