import { automationState } from "./state.js";

export function slice(root) {
  return root.auto || automationState;
}

export function isAnyAutomationEnabled(root) {
  const a = slice(root);
  return !!(a.meditate || a.adventure);
}
