import { physiqueState } from "./state.js";
import { selectAstral } from "../../shared/selectors.js";

export const PhysiqueFeature = {
  key: "physique",
  initialState: () => ({ ...physiqueState, _v: 0 }),
  nav: {
    visible(root) {
      return selectAstral.isNodeUnlocked(4060, root);
    },
  },
};
