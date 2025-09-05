import { adventureState } from "./state.js";
import { featureFlags } from "../../config.js";
import { selectProgress } from "../../shared/selectors/index.js";

export const AdventureFeature = {
  key: "adventure",
  initialState: () => ({ ...adventureState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.adventure && selectProgress.mortalStage(root) >= 5;
    },
  },
};
