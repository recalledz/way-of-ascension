import { sectState } from "./state.js";
import { featureFlags } from "../../config.js";
import { selectProgress } from "../../shared/selectors/index.js";

export const SectFeature = {
  key: "sect",
  initialState: () => ({ ...sectState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.sect && selectProgress.mortalStage(root) >= 3;
    },
  },
};
