import { karmaState } from "./state.js";
import { featureFlags } from "../../config.js";

export const KarmaFeature = {
  key: "karma",
  initialState: () => ({ ...karmaState, _v: 0 }),
  nav: {
    visible() {
      return featureFlags.karma;
    },
  },
};
