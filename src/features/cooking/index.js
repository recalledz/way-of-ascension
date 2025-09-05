import { cookingState } from "./state.js";
import { featureFlags } from "../../config.js";
import { selectSect } from "../../shared/selectors/index.js";

export const CookingFeature = {
  key: "cooking",
  initialState: () => ({ ...cookingState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.cooking && selectSect.isBuildingBuilt('kitchen', root);
    },
  },
};
