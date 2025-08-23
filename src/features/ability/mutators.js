import { S } from '../../shared/state.js';
import { ABILITIES } from './data/abilities.js';
import { resolveAbilityHit } from './logic.js';
import { getEquippedWeapon } from '../inventory/selectors.js';

export function tryCastAbility(abilityKey, state = S, roll = 0) {
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

  state.actionQueue.push({
    type: 'ABILITY_HIT',
    abilityKey,
    roll,
    timeRemaining: ability.castTimeMs || 0,
  });

  return true;
}

export function tickAbilityCooldowns(dtMs, state = S) {
  if (!state.abilityCooldowns) return;
  for (const k in state.abilityCooldowns) {
    state.abilityCooldowns[k] = Math.max(0, state.abilityCooldowns[k] - dtMs);
  }
}

function tickActionQueue(dtMs, state = S) {
  if (!state.actionQueue || !state.actionQueue.length) return;
  const ready = [];
  for (const action of state.actionQueue) {
    action.timeRemaining = Math.max(0, (action.timeRemaining || 0) - dtMs);
    if (action.timeRemaining === 0) ready.push(action);
  }
  state.actionQueue = state.actionQueue.filter(a => a.timeRemaining > 0);
  for (const action of ready) {
    if (action.type === 'ABILITY_HIT') {
      resolveAbilityHit(action.abilityKey, state, { roll: action.roll });
    }
  }
}

export function tickAbility(state = S, dtMs) {
  tickAbilityCooldowns(dtMs, state);
  tickActionQueue(dtMs, state);
}
