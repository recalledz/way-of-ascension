// src/features/mind/index.js

import { defaultMindState, ensureMindState } from './state.js';
import { featureFlags } from '../../config.js';
import { selectAstral } from '../../shared/selectors.js';

export { defaultMindState, ensureMindState } from './state.js';

export {
  calcFromProficiency,
  calcManualSpeed,
  calcFromManual,
  calcFromCraft,
  applyPuzzleMultiplier,
  levelForXp,
  xpProgress,
} from './logic.js';

export {
  awardFromProficiency,
  startReading,
  stopReading,
  debugLevelManual,
  craftTalisman,
  solvePuzzle,
  onTick,
} from './mutators.js';

export {
  getMind,
  mindBreakdown,
  currentMindLevel,
  currentMindXp,
} from './selectors.js';

export const MindFeature = {
  key: 'mind',
  initialState: () => ({ ...defaultMindState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.mind && selectAstral.isNodeUnlocked(4061, root);
    },
  },
};

