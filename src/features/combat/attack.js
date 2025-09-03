import { STATUSES_BY_ELEMENT } from './data/statusesByElement.js';
import { applyAilment, applyStatus } from './mutators.js';
import { mergeStats } from '../../shared/utils/stats.js';

export function performAttack(attacker, target, options = {}, state) { // STATUS-REFORM
  const { ability, isCrit = false, weapon, profile, physDamage = 0 } = options;

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
    const applied = applyAilment(attackerCtx, target, key, isCrit ? 1 : power, now);
    console.log(`[status] ${key} ${applied ? 'applied' : 'failed'} ${isCrit ? '(crit)' : ''}`); // STATUS-REFORM
  } else if (attackElement && STATUSES_BY_ELEMENT[attackElement]) { // STATUS-REFORM
    const { key, power } = STATUSES_BY_ELEMENT[attackElement];
    const applied = applyAilment(attackerCtx, target, key, isCrit ? 1 : power, now);
    console.log(`[status] ${key} ${applied ? 'applied' : 'failed'} ${isCrit ? '(crit)' : ''}`); // STATUS-REFORM
  }

  if (attackIsPhysical && physDamage > 0) { // STATUS-REFORM
    const maxHp =
      target?.stats?.hpMax ??
      target?.hpMax ??
      state?.adventure?.enemyMaxHP ??
      0;
    if (maxHp > 0 && !target.statuses?.interrupt) {
      const chance = physDamage / maxHp;
      if (chance >= 0.02 && Math.random() < chance) {
        applyStatus(target, 'interrupt', 1, state, { attackerStats, targetStats });
      }
    }
  }
}

export function decayStunBar(value, deltaTime, decayRate = 5) { // STATUS-REFORM
  return Math.max(0, value - decayRate * deltaTime);
}
