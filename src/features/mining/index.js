import { miningState } from "./state.js";
import { selectAstral } from "../../shared/selectors.js";

export const MiningFeature = {
  key: "mining",
  initialState: () => ({ ...miningState, _v: 0 }),
  nav: {
    visible(root) {
      return selectAstral.isNodeUnlocked(4060, root);
    },
  },
};
