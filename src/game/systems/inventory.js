import { S, save } from '../state.js';
import { WEAPONS } from '../../data/weapon.legacy.js';

// EQUIP-CHAR-UI: basic inventory helpers
export function addToInventory(item) {
  S.inventory = S.inventory || [];
  const id = item.id || Date.now() + Math.random();
  S.inventory.push({ ...item, id });
  save?.();
  return id;
}

export function removeFromInventory(id) {
  S.inventory = S.inventory || [];
  const idx = S.inventory.findIndex(it => it.id === id);
  if (idx >= 0) {
    S.inventory.splice(idx, 1);
    save?.();
    return true;
  }
  return false;
}

export function canEquip(item) {
  if (!item) return false;
  switch (item.type) {
    case 'weapon':
      return { slot: 'mainhand' };
    case 'armor':
      if (item.slot === 'head' || item.slot === 'torso') return { slot: item.slot };
      break;
    case 'food':
      return { slot: 'food' };
  }
  return false;
}

export function equipItem(item) {
  const info = canEquip(item);
  if (!info) return false;
  const slot = info.slot;
  // Simple requirement check placeholder
  const existing = S.equipment[slot];
  if (existing && existing.key) addToInventory(existing);
  S.equipment[slot] = { key: item.key, type: item.type, slot: item.slot };
  removeFromInventory(item.id);
  console.log('[equip]', 'slot→', slot, 'item→', item.key);
  if (slot === 'mainhand') {
    const hud = document.getElementById('currentWeapon');
    if (hud) hud.textContent = WEAPONS[item.key]?.displayName || item.key;
    const chip = document.getElementById('weaponName');
    if (chip) chip.textContent = WEAPONS[item.key]?.displayName || item.key;
  }
  save?.();
  return true;
}

export function unequip(slot) {
  const item = S.equipment[slot];
  if (!item) return;
  addToInventory(item);
  S.equipment[slot] = null;
  console.log('[equip]', 'slot→', slot, 'item→', 'none');
  if (slot === 'mainhand') {
    const hud = document.getElementById('currentWeapon');
    if (hud) hud.textContent = 'Fists';
    const chip = document.getElementById('weaponName');
    if (chip) chip.textContent = 'fist';
  }
  save?.();
}
