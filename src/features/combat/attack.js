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
    const baseGain = (physDamageDealt / target.hpMax) * 100;
    const buildMult = 1 + (attackerStats.stunBuildMult || 0);
    const takenMult = 1 - (targetStats.stunBuildTakenReduction || 0);
    const gain = baseGain * buildMult * takenMult;
    const before = target.stunBar || 0; // STATUS-REFORM
    target.stunBar = Math.min(100, before + gain); // STATUS-REFORM
    console.log(`[stun] bar=${Math.round(before)} → ${Math.round(target.stunBar)} (damage=${physDamageDealt})`); // STATUS-REFORM
    if (target.stunBar >= 100) { // STATUS-REFORM
      if (Math.random() >= (targetStats.stunResist || 0)) {
        console.log('[stun] threshold reached → stunned'); // STATUS-REFORM
        applyStatus(target, 'stun', 1, state, { attackerStats, targetStats }); // STATUS-REFORM
      } else {
        console.log('[stun] resisted'); // STATUS-REFORM
      }
      target.stunBar = 0; // STATUS-REFORM
    }
    applyStatus(target, 'interrupt', 0.05, state, { attackerStats, targetStats }); // STATUS-REFORM
  }
}

export function decayStunBar(value, deltaTime, decayRate = 5) { // STATUS-REFORM
  return Math.max(0, value - decayRate * deltaTime);
}
