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
  const unlocked = weapon.abilityKeys?.includes(abilityKey) || state.manualAbilityKeys?.includes(abilityKey);
  if (!unlocked) return false;
  const mods = state.abilityMods?.[abilityKey] || {};
  const cd = state.abilityCooldowns?.[abilityKey] || 0;
  if (cd > 0) return false;
  if (state.qi < ability.costQi) return false;
  if (!state.abilityCooldowns) state.abilityCooldowns = {};
  const cooldownMs = Math.round(ability.cooldownMs * (1 + (mods.cooldownPct || 0) / 100));
  state.abilityCooldowns[abilityKey] = cooldownMs;
  if (!state.actionQueue) state.actionQueue = [];
  const enqueue = () => state.actionQueue.push({ type: 'ABILITY_HIT', abilityKey });
  let castTimeMs = Math.round(ability.castTimeMs * (1 + (mods.castTimePct || 0) / 100));
  if (castTimeMs > 0) setTimeout(enqueue, castTimeMs);
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
  const mods = state.abilityMods?.[abilityKey];
  if (res.attack) {
    if (mods?.damagePct) {
      res.attack.amount = Math.round(res.attack.amount * (1 + mods.damagePct / 100));
    }
    const { amount, type, target } = res.attack;
    const dealt = processAttack(amount, { target, type, attacker: state, nowMs: Date.now() }, state);
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
