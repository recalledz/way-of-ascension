import { adventureState } from "./state.js";

export const AdventureFeature = {
  key: "adventure",
  initialState: () => ({ ...adventureState, _v: 0 }),
};
