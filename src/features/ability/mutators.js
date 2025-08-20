import { S } from '../../shared/state.js';
import { ABILITIES } from './data/abilities.js';
import { resolveAbilityHit } from './logic.js';
import { getEquippedWeapon } from '../inventory/selectors.js';

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
    if (action.type === 'ABILITY_HIT') resolveAbilityHit(action.abilityKey, state);
  }
}
