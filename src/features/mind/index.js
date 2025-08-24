// src/features/mind/index.js

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

