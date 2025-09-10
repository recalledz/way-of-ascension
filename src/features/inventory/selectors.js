import { S } from '../../shared/state.js';
import { FIST } from '../weaponGeneration/data/weapons.js';

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
  if (!state.flags?.weaponsEnabled) return FIST;
  const eq = state.equipment?.mainhand;
  return eq || FIST;
}
