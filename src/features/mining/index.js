import { miningState } from "./state.js";

export const MiningFeature = {
  key: "mining",
  initialState: () => ({ ...miningState, _v: 0 }),
};
