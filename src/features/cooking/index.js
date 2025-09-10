import { cookingState } from "./state.js";
import { selectSect } from "../../shared/selectors.js";
import { autoConsumeFood } from "./logic.js";
import { registerFeature } from "../registry.js";

export const CookingFeature = {
  key: "cooking",
  initialState: () => ({ ...cookingState, _v: 0 }),
  nav: {
    visible(root) {
      return selectSect.isBuildingBuilt('kitchen', root);
    },
  },
};

registerFeature({
  id: "cooking",
  init: () => ({ ...cookingState, _v: 0 }),
  tick: (state, stepMs) => autoConsumeFood(state, stepMs),
});
