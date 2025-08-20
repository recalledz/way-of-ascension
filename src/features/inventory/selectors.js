import { S } from '../../shared/state.js';
import { WEAPONS } from '../weaponGeneration/data/weapons.js';

export function getInventory(state = S) {
  return state.inventory || [];
}

export function getEquipment(state = S) {
  return state.equipment || {};
}

export function getEquippedWeapon(state = S) {
  if (!state.flags?.weaponsEnabled) return WEAPONS.fist;
  const eq = state.equipment?.mainhand;
  const key = typeof eq === 'string' ? eq : eq?.key;
  return WEAPONS[key] || WEAPONS.fist;
}
