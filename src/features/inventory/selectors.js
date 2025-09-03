import { S } from '../../shared/state.js';
import { WEAPONS } from '../weaponGeneration/data/weapons.js';

export function getInventory(state = S) {
  return state.inventory || [];
}

export function getEquipment(state = S) {
  return state.equipment || {};
}

export function getEquipped(slot, state = S) {
  return state.equipment?.[slot] || null;
}

export function getEquippedWeapon(state = S) {
  if (!state.flags?.weaponsEnabled) return WEAPONS.fist;
  const eq = state.equipment?.mainhand;
  const key = typeof eq === 'string' ? eq : eq?.key;
  if (WEAPONS[key]) return WEAPONS[key];
  if (eq && typeof eq === 'object') {
    return { ...eq, key, displayName: eq.displayName || eq.name || key };
  }
  return WEAPONS.fist;
}
