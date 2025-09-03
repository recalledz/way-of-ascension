import { gatheringState } from "./state.js";
export const GatheringFeature = {
  key: "gathering",
  initialState: () => ({ ...gatheringState, _v: 0 }),
};
