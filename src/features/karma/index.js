import { karmaState } from "./state.js";

export const KarmaFeature = {
  key: "karma",
  initialState: () => ({ ...karmaState, _v: 0 }),
};
