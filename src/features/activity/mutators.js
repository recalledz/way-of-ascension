// src/features/activity/mutators.js
import { ensureActivities } from "./state.js";
import { emit } from "../../shared/events.js";

export function selectActivity(root, name) {
  root.ui ??= {};
  root.ui.selectedActivity = name;
  emit("UI:ACTIVITY_SELECTED", { name });
}

export function startActivity(root, name) {
  ensureActivities(root);
  for (const k of Object.keys(root.activities)) root.activities[k] = (k === name);

  // Let features react without coupling:
  emit("ACTIVITY:START", { name });

  // Convenience side-effects that used to live in ui/index.js:
  if (name === "mining") root.mining ??= { level: 1, exp: 0, expMax: 100, selectedResource: root.mining?.selectedResource || "stones" };
}

export function stopActivity(root, name) {
  ensureActivities(root);
  if (name in root.activities) root.activities[name] = false;
  emit("ACTIVITY:STOP", { name });
}
