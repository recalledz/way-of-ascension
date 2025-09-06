import { cookingState } from "./state.js";
import { selectSect } from "../../shared/selectors.js";

export const CookingFeature = {
  key: "cooking",
  initialState: () => ({ ...cookingState, _v: 0 }),
  nav: {
    visible(root) {
      return selectSect.isBuildingBuilt('kitchen', root);
    },
  },
};
