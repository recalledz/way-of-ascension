import { STATUSES_BY_ELEMENT } from '../../data/statusesByElement.js';
import { applyStatus } from './statusEngine.js';

export function performAttack(attacker, target, options = {}, state) { // STATUS-REFORM
  const { ability, attackElement, attackIsPhysical, physDamageDealt = 0, isCrit = false, usingPalm = false } = options;

  if (ability && ability.status) { // STATUS-REFORM
    const { key, power } = ability.status;
    const chance = isCrit ? 1 : power;
    if (Math.random() < chance) {
      console.log(`[status] ${key} applied ${isCrit ? '(crit)' : '(roll)'}`); // STATUS-REFORM
      applyStatus(target, key, power, state); // STATUS-REFORM
    } else {
      console.log(`[status] ${key} failed (roll)`); // STATUS-REFORM
    }
  } else if (attackElement && STATUSES_BY_ELEMENT[attackElement]) { // STATUS-REFORM
    const { key, power } = STATUSES_BY_ELEMENT[attackElement];
    const chance = isCrit ? 1 : power;
    if (Math.random() < chance) {
      console.log(`[status] ${key} applied ${isCrit ? '(crit)' : '(roll)'}`); // STATUS-REFORM
      applyStatus(target, key, power, state); // STATUS-REFORM
    } else {
      console.log(`[status] ${key} failed (roll)`); // STATUS-REFORM
    }
  }

  if (attackIsPhysical) { // STATUS-REFORM
    const modifier = usingPalm ? 1.3 : 1; // STATUS-REFORM
    const gain = (physDamageDealt / target.hpMax) * 100 * modifier; // STATUS-REFORM
    const before = target.stunBar || 0; // STATUS-REFORM
    target.stunBar = Math.min(100, before + gain); // STATUS-REFORM
    console.log(`[stun] bar=${Math.round(before)} → ${Math.round(target.stunBar)} (damage=${physDamageDealt})`); // STATUS-REFORM
    if (target.stunBar >= 100) { // STATUS-REFORM
      console.log('[stun] threshold reached → stunned'); // STATUS-REFORM
      applyStatus(target, 'stun', 1, state); // STATUS-REFORM
      target.stunBar = 0; // STATUS-REFORM
    }
    applyStatus(target, 'interrupt', 0.05, state); // STATUS-REFORM
  }
}

export function decayStunBar(value, deltaTime, decayRate = 5) { // STATUS-REFORM
  return Math.max(0, value - decayRate * deltaTime);
}
