import { alchemyState } from "./state.js";
import { featureFlags } from "../../config.js";
import { selectSect } from "../../shared/selectors/index.js";

export const AlchemyFeature = {
  key: "alchemy",
  initialState: () => ({ ...alchemyState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.alchemy && selectSect.isBuildingBuilt('alchemy', root);
    },
  },
};
