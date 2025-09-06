import { progressionState } from "./state.js";
import { featureFlags } from "../../config.js";

export const ProgressionFeature = {
  key: "progression",
  initialState: () => ({ ...progressionState, _v: 0 }),
  nav: {
    visible() {
      return featureFlags.cultivation;
    },
  },
};

export {
  updateRealmUI,
  updateActivityCultivation,
  updateBreakthrough,
  initRealmUI,
  getRealmName,
} from './ui/realm.js';

export { advanceRealm, checkLawUnlocks, awardLawPoints } from './mutators.js';

export {
  updateLawsDisplay,
  renderLawSelection,
  renderSkillTrees,
  mountLawDisplay,
} from './ui/lawDisplay.js';
