import { STATUSES_BY_ELEMENT } from './data/statusesByElement.js';
import { applyAilment, applyStatus } from './mutators.js';
import { mergeStats } from '../../shared/utils/stats.js';

export function performAttack(attacker, target, options = {}, state) { // STATUS-REFORM
  const { ability, isCrit = false, weapon, profile } = options;

  let attackElement;
  let attackIsPhysical = false;
  if (profile) {
    attackIsPhysical = (profile.phys || 0) > 0;
    const elems = profile.elems || {};
    attackElement = Object.keys(elems).reduce(
      (best, elem) => (elems[elem] > (elems[best] || 0) ? elem : best),
      undefined
    );
  }

  const attackerStats = mergeStats(attacker?.stats, weapon?.stats);
  const targetStats = target?.stats || {};
  const attackerCtx = { ...(attacker || {}), stats: attackerStats };
  const now = Date.now();

  if (ability && ability.status) { // STATUS-REFORM
    const { key, power } = ability.status;
    const chance = isCrit ? 1 : power;
    if (Math.random() < chance) {
      console.log(`[status] ${key} applied ${isCrit ? '(crit)' : '(roll)'}`); // STATUS-REFORM
      applyAilment(attackerCtx, target, key, power, now);
    } else {
      console.log(`[status] ${key} failed (roll)`); // STATUS-REFORM
    }
  } else if (attackElement && STATUSES_BY_ELEMENT[attackElement]) { // STATUS-REFORM
    const { key, power } = STATUSES_BY_ELEMENT[attackElement];
    const chance = isCrit ? 1 : power;
    if (Math.random() < chance) {
      console.log(`[status] ${key} applied ${isCrit ? '(crit)' : '(roll)'}`); // STATUS-REFORM
      applyAilment(attackerCtx, target, key, power, now);
    } else {
      console.log(`[status] ${key} failed (roll)`); // STATUS-REFORM
    }
  }

  if (attackIsPhysical) { // STATUS-REFORM
    // Stun accumulation is now handled by processAttack/onPhysicalHit.
    // Keep only interrupt application here to avoid NaN when hpMax is missing.
    applyStatus(target, 'interrupt', 0.05, state, { attackerStats, targetStats });
  }
}

export function decayStunBar(value, deltaTime, decayRate = 5) { // STATUS-REFORM
  return Math.max(0, value - decayRate * deltaTime);
}
