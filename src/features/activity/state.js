// src/features/activity/state.js
export function ensureActivities(root) {
  if (!root.activities) {
    root.activities = {
      cultivation: false,
      physique: false,
      mining: false,
      gathering: false,
      adventure: false,
      cooking: false,
      alchemy: false,
      sect: false,
      forging: false,
    };
  }
}
