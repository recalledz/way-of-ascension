import { S } from '../../game/state.js';
import { ABILITIES } from './data/abilities.js';
import { getEquippedWeapon } from '../inventory/selectors.js';

export function getAbilityCooldowns(state = S) {
  return state.abilityCooldowns || {};
}

export function getAbilitySlots(state = S) {
  const slots = [];
  const weapon = getEquippedWeapon(state);
  const abilityKey = weapon.abilityKeys?.[0];
  for (let i = 0; i < 6; i++) {
    if (i === 0 && abilityKey) {
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
