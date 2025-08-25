import { STATUSES_BY_ELEMENT } from './data/statusesByElement.js';
import { applyStatus } from './mutators.js';
import { mergeStats } from '../../shared/utils/stats.js';

export function performAttack(attacker, target, options = {}, state) { // STATUS-REFORM
  const { ability, attackElement, attackIsPhysical, physDamageDealt = 0, isCrit = false, weapon } = options;

  const attackerStats = mergeStats(attacker?.stats, weapon?.stats);
  const targetStats = target?.stats || {};

  if (ability && ability.status) { // STATUS-REFORM
    const { key, power } = ability.status;
    const chance = isCrit ? 1 : power;
    if (Math.random() < chance) {
      console.log(`[status] ${key} applied ${isCrit ? '(crit)' : '(roll)'}`); // STATUS-REFORM
      applyStatus(target, key, power, state, { attackerStats, targetStats }); // STATUS-REFORM
    } else {
      console.log(`[status] ${key} failed (roll)`); // STATUS-REFORM
    }
  } else if (attackElement && STATUSES_BY_ELEMENT[attackElement]) { // STATUS-REFORM
    const { key, power } = STATUSES_BY_ELEMENT[attackElement];
    const chance = isCrit ? 1 : power;
    if (Math.random() < chance) {
      console.log(`[status] ${key} applied ${isCrit ? '(crit)' : '(roll)'}`); // STATUS-REFORM
      applyStatus(target, key, power, state, { attackerStats, targetStats }); // STATUS-REFORM
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
