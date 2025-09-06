import { gatheringState } from "./state.js";
import { featureFlags } from "../../config.js";
import { selectAstral } from "../../shared/selectors.js";

export const GatheringFeature = {
  key: "gathering",
  initialState: () => ({ ...gatheringState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.gathering && selectAstral.isNodeUnlocked(4061, root);
    },
  },
};
