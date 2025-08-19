// Centralized state selectors.
// Never read state fields directly; use selectors.

import { WEAPONS } from '../features/weaponGeneration/data/weapons.js';
import { ABILITIES } from '../data/abilities.js';
import { S } from './state.js';

export function getEquippedWeapon(state = S) {
  // WEAPONS-INTEGRATION: respect feature flag and invalid keys
  if (!state.flags?.weaponsEnabled) return WEAPONS.fist;
  const eq = state.equipment?.mainhand;
  const key = typeof eq === 'string' ? eq : eq?.key;
  return WEAPONS[key] || WEAPONS.fist;
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

