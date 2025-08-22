// src/features/activity/selectors.js
export function getActiveActivity(root) {
  if (!root.activities) return null;
  return Object.keys(root.activities).find(k => root.activities[k]) ?? null;
}
export function getSelectedActivity(root) {
  return root.ui?.selectedActivity || 'cultivation';
}
