import { proficiencyState } from "./state.js";
import { featureFlags } from "../../config.js";
import { selectProgress } from "../../shared/selectors.js";

export const ProficiencyFeature = {
  key: "proficiency",
  initialState: () => ({ ...proficiencyState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.proficiency && selectProgress.mortalStage(root) >= 5;
    },
  },
};
