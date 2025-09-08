import { STATUSES } from '../combat/data/status.js';
import { applyStatus } from '../combat/statusEngine.js';

export function applyConsumableEffect(target, statusKey, state) {
  const def = STATUSES[statusKey];
  if (!def) return false;

  const group = def.exclusivityGroup;
  const tier = def.tier ?? 0;

  target.statuses ??= {};

  let existingKey = null;
  let existingTier = -Infinity;
  for (const k of Object.keys(target.statuses)) {
    const d = STATUSES[k];
    if (!d) continue;
    if (d.exclusivityGroup === group) {
      existingKey = k;
      existingTier = d.tier ?? 0;
      break;
    }
  }

  if (existingKey) {
    if (existingKey === statusKey) {
      applyStatus(target, statusKey, 1, state);
      return true;
    }
    if (existingTier > tier) {
      // Higher tier already active; ignore
      return false;
    }
    const oldDef = STATUSES[existingKey];
    oldDef?.onExpire?.({ target });
    delete target.statuses[existingKey];
  }

  applyStatus(target, statusKey, 1, state);
  // TODO: integrate consumable-derived bonus soft caps when system exists
  return true;
}
