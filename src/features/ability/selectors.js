import { S } from '../../shared/state.js';
import { ABILITIES } from './data/abilities.js';
import { getEquippedWeapon } from '../inventory/selectors.js';

export function getAbilityCooldowns(state = S) {
  return state.abilityCooldowns || {};
}

export function getAbilitySlots(state = S) {
  const slots = [];
  const weapon = getEquippedWeapon(state);

  // Build ordered list of ability keys: weapon ability first, then manual abilities
  const abilityKeys = [];
  if (weapon.abilityKeys?.[0]) abilityKeys.push(weapon.abilityKeys[0]);
  if (state.manualAbilityKeys) abilityKeys.push(...state.manualAbilityKeys);

  for (let i = 0; i < 6; i++) {
    const abilityKey = abilityKeys[i];
    if (abilityKey) {
      const def = ABILITIES[abilityKey];
      const meetsReq = def && (!def.requiresWeaponType || def.requiresWeaponType === weapon.typeKey);
      if (meetsReq) {
        const cooldown = state.abilityCooldowns?.[abilityKey] || 0;
        slots.push({
          keybind: i + 1,
          abilityKey,
          isReady: cooldown <= 0 && state.qi >= def.costQi,
          cooldownRemainingMs: cooldown,
          insufficientQi: state.qi < def.costQi,
        });
        continue;
      }
    }
    slots.push({ keybind: i + 1, abilityKey: undefined, isReady: false, cooldownRemainingMs: 0, insufficientQi: false });
  }
  return slots;
}
