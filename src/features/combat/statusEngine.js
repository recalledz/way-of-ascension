import { STATUSES } from './data/status.js';

export function applyStatus(target, key, power, state) { // STATUS-REFORM
  const def = STATUSES[key];
  if (!def) return;
  if (!target.statuses) target.statuses = {};
  const current = target.statuses[key] || { stacks: 0, duration: 0 };
  current.stacks = Math.min(def.maxStacks ?? Infinity, current.stacks + 1);
  current.duration = def.duration;
  target.statuses[key] = current;
}
