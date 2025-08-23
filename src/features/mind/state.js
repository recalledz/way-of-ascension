// src/features/mind/state.js

export const defaultMindState = {
  xp: 0,
  level: 1,
  multiplier: 1,
  fromProficiency: 0,
  fromReading: 0,
  fromCrafting: 0,
  activeManualId: null,
  manualProgress: {},
  // { manualId: { xp: number, done: boolean } }
  solvedPuzzles: 0,
};

export function ensureMindState(root = {}) {
  if (!root.mind) {
    root.mind = { ...defaultMindState };
  }
  return root;
}

