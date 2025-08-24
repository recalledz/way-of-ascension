import { STATUSES } from './data/status.js';

export function applyStatus(target, key, power, state, options = {}) { // STATUS-REFORM
  const def = STATUSES[key];
  if (!def) return;
  const { attackerStats = {}, targetStats = {} } = options;
  if (!target.statuses) target.statuses = {};
  const current = target.statuses[key] || { stacks: 0, duration: 0 };
  current.stacks = Math.min(def.maxStacks ?? Infinity, current.stacks + 1);
  let duration = def.duration;
  if (key === 'stun') {
    duration *= 1 + (attackerStats.stunDurationMult || 0);
    duration *= 1 - (targetStats.stunResist || 0);
  }
  duration *= 1 - (targetStats.ccResist || 0);
  current.duration = duration;
  target.statuses[key] = current;
}
