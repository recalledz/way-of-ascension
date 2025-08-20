import { S, save } from '../../game/state.js';
import { WEAPONS } from '../weaponGeneration/data/weapons.js';
import { recomputePlayerTotals, canEquip } from './logic.js';

export function addToInventory(item, state = S) {
  state.inventory = state.inventory || [];
  const id = item.id || Date.now() + Math.random();
  state.inventory.push({ ...item, id });
  save?.();
  return id;
}

export function removeFromInventory(id, state = S) {
  state.inventory = state.inventory || [];
  const idx = state.inventory.findIndex(it => it.id === id);
  if (idx >= 0) {
    state.inventory.splice(idx, 1);
    save?.();
    return true;
  }
  return false;
}

export function equipItem(item, state = S) {
  const info = canEquip(item);
  if (!info) return false;
  const slot = info.slot;
  const existing = state.equipment[slot];
  const existingKey = typeof existing === 'string' ? existing : existing?.key;
  if (existingKey && existingKey !== 'fist') addToInventory(existing, state);
  const { id, ...equipData } = item;
  state.equipment[slot] = equipData;
  removeFromInventory(id, state);
  console.log('[equip]', 'slot→', slot, 'item→', item.key);
  if (slot === 'mainhand') {
    const hud = document.getElementById('currentWeapon');
    if (hud) hud.textContent = WEAPONS[item.key]?.displayName || item.key;
    const chip = document.getElementById('weaponName');
    if (chip) chip.textContent = WEAPONS[item.key]?.displayName || item.key;
  }
  recomputePlayerTotals(state);
  save?.();
  return true;
}

export function unequip(slot, state = S) {
  const item = state.equipment[slot];
  if (!item) return;
  const key = typeof item === 'string' ? item : item.key;
  if (key !== 'fist') addToInventory(item, state);
  state.equipment[slot] = null;
  console.log('[equip]', 'slot→', slot, 'item→', 'none');
  if (slot === 'mainhand') {
    const hud = document.getElementById('currentWeapon');
    if (hud) hud.textContent = 'Fists';
    const chip = document.getElementById('weaponName');
    if (chip) chip.textContent = 'fist';
  }
  recomputePlayerTotals(state);
  save?.();
}
