import { S } from '../../shared/state.js';
import { ABILITIES } from './data/abilities.js';
import { resolveAbilityHit } from './logic.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { processAttack } from '../combat/mutators.js';
import { emit } from '../../shared/events.js';
import { qCap } from '../progression/selectors.js';

export function tryCastAbility(abilityKey, state = S) {
  const ability = ABILITIES[abilityKey];
  if (!ability) return false;
  if (!state.adventure?.inCombat) return false;
  const weapon = getEquippedWeapon(state);
  if (ability.requiresWeaponType && ability.requiresWeaponType !== weapon.typeKey) return false;
  if (!weapon.abilityKeys?.includes(abilityKey)) return false;
  const cd = state.abilityCooldowns?.[abilityKey] || 0;
  if (cd > 0) return false;
  if (state.qi < ability.costQi) return false;
  if (!state.abilityCooldowns) state.abilityCooldowns = {};
  state.abilityCooldowns[abilityKey] = ability.cooldownMs;
  if (!state.actionQueue) state.actionQueue = [];
  const enqueue = () => state.actionQueue.push({ type: 'ABILITY_HIT', abilityKey });
  if (ability.castTimeMs > 0) setTimeout(enqueue, ability.castTimeMs);
  else {
    enqueue();
    processAbilityQueue(state);
  }
  return true;
}

export function tickAbilityCooldowns(dtMs, state = S) {
  if (!state.abilityCooldowns) return;
  for (const k in state.abilityCooldowns) {
    state.abilityCooldowns[k] = Math.max(0, state.abilityCooldowns[k] - dtMs);
  }
}

export function processAbilityQueue(state = S) {
  if (!state.actionQueue || !state.actionQueue.length) return;
  while (state.actionQueue.length) {
    const action = state.actionQueue.shift();
    if (action.type === 'ABILITY_HIT') {
      const res = resolveAbilityHit(action.abilityKey, state);
      applyAbilityResult(action.abilityKey, res, state);
    }
  }
}

function applyAbilityResult(abilityKey, res, state) {
  if (!res) return;
  const ability = ABILITIES[abilityKey];
  const logs = state.adventure?.combatLog;
  if (res.attack) {
    const { amount, type, target } = res.attack;
    const dealt = processAttack(amount, { target, type }, state);
    logs?.push(`You used ${ability.displayName} for ${dealt} ${type === 'physical' ? 'Physical ' : ''}damage.`);
    if (res.healOnHit && dealt > 0) {
      const healed = Math.min(res.healOnHit, state.hpMax - state.hp);
      state.hp += healed;
      state.adventure.playerHP = state.hp;
      logs?.push(`You recovered ${healed} HP.`);
      emit('ABILITY:HEAL', { amount: healed });
    }
  }
  if (res.defeatEnemy) {
    const before = state.adventure.enemyHP || 0;
    state.adventure.enemyHP = 0;
    logs?.push(`You unleash 75%! It deals ${Math.round(before)} true damage and fells the enemy.`);
  }
  if (res.healToFull) {
    const healAmt = Math.max(0, state.hpMax - state.hp);
    state.hp = state.hpMax;
    state.adventure.playerHP = state.hpMax;
    if (healAmt > 0) {
      logs?.push(`You are restored for ${healAmt} HP.`);
      emit('ABILITY:HEAL', { amount: healAmt });
    }
  }
  if (res.restoreQi) {
    try {
      state.qi = qCap(state);
    } catch {
      state.qi = state.qiMax || state.qi || 0;
    }
  }
}
