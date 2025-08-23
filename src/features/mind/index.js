// src/features/mind/index.js

export { defaultMindState, ensureMindState } from './state.js';

export {
  calcFromProficiency,
  calcFromManual,
  calcFromCraft,
  applyPuzzleMultiplier,
  levelForXp,
} from './logic.js';

export {
  awardFromProficiency,
  startReading,
  stopReading,
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

