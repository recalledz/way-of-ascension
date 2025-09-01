import { S, save } from '../../shared/state.js';
import { WEAPONS } from '../weaponGeneration/data/weapons.js';
import { emit } from '../../shared/events.js';
import { recomputePlayerTotals, canEquip } from './logic.js';
import { qCap, clamp } from '../progression/selectors.js';

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

export function equipItem(item, slot = null, state = S) {
  const info = canEquip(item, slot, state);
  if (!info) return false;
  const slotKey = info.slot;
  const existing = state.equipment[slotKey];
  const existingKey = typeof existing === 'string' ? existing : existing?.key;
  if (existingKey && existingKey !== 'fist') addToInventory(existing, state);
  const { id, ...equipData } = item;
  state.equipment[slotKey] = equipData;
  removeFromInventory(id, state);
  console.log('[equip]', 'slot→', slotKey, 'item→', item.key);
  recomputePlayerTotals(state);
  save?.();
  const payload = { key: item.key, name: WEAPONS[item.key]?.displayName || item.name || item.key, slot: slotKey };
  if (slotKey === 'mainhand') emit('INVENTORY:MAINHAND_CHANGED', payload);
  return payload;
}

export function unequip(slot, state = S) {
  const item = state.equipment[slot];
  if (!item) return;
  const key = typeof item === 'string' ? item : item.key;
  if (key !== 'fist') addToInventory(item, state);
  state.equipment[slot] = null;
  console.log('[equip]', 'slot→', slot, 'item→', 'none');
  recomputePlayerTotals(state);
  save?.();
  const payload = { key: 'fist', name: 'Fists', slot };
  if (slot === 'mainhand') emit('INVENTORY:MAINHAND_CHANGED', payload);
  return payload;
}

export function usePill(root, type) {
  root.pills ??= { qi: 0, body: 0, ward: 0 };
  if ((root.pills[type] ?? 0) <= 0) return { ok: false, reason: 'none' };

  if (type === 'qi') {
    const add = Math.floor(qCap(root) * 0.25);
    root.qi = clamp(root.qi + add, 0, qCap(root));
  }
  if (type === 'body') {
    root.tempAtk = (root.tempAtk || 0) + 4;
    root.tempArmor = (root.tempArmor || 0) + 3;
    // NOTE: timer remains in UI for now; long-term move to a timed effect system
  }
  if (type === 'ward') {
    // consumed during breakthrough
  }

  root.pills[type]--;
  return { ok: true, type };
}
