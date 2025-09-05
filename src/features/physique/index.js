import { physiqueState } from "./state.js";
import { featureFlags } from "../../config.js";
import { selectAstral } from "../../shared/selectors/index.js";

export const PhysiqueFeature = {
  key: "physique",
  initialState: () => ({ ...physiqueState, _v: 0 }),
  nav: {
    visible() {
      return featureFlags.physique && selectAstral.isNodeUnlocked(4060);
    },
  },
};
