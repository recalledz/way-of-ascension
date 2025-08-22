import { cookingState } from "./state.js";

export const CookingFeature = {
  key: "cooking",
  initialState: () => ({ ...cookingState, _v: 0 }),
};
