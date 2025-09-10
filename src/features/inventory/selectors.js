import { S } from '../../shared/state.js';

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
  const fists = { key: 'fist', name: 'Fists', typeKey: 'fist', classKey: 'fist', slot: 'mainhand' };
  if (!state.flags?.weaponsEnabled) return fists;
  const eq = state.equipment?.mainhand;
  if (!eq) return fists;
  if (typeof eq === 'string') {
    return { ...fists, key: eq, name: eq, typeKey: eq, classKey: eq };
  }
  return { slot: 'mainhand', ...eq, name: eq.name || eq.key };
}
