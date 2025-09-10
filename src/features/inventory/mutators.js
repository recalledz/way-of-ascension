import { S, save } from '../../shared/state.js';
import { emit } from '../../shared/events.js';
import { recomputePlayerTotals, canEquip } from './logic.js';
export { usePill } from '../alchemy/mutators.js'; // deprecated shim

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

export function moveToJunk(id, state = S) {
  state.inventory = state.inventory || [];
  state.junk = state.junk || [];
  const idx = state.inventory.findIndex(it => it.id === id);
  if (idx >= 0) {
    const [item] = state.inventory.splice(idx, 1);
    state.junk.push(item);
    save?.();
    return true;
  }
  return false;
}

export function sellJunk(state = S) {
  state.junk = state.junk || [];
  const total = state.junk.reduce((sum, it) => sum + (it.qty || 1), 0);
  if (total > 0) {
    state.coin = (state.coin || 0) + total;
    state.junk = [];
    save?.();
  }
  return total;
}

export function equipItem(item, slot = null, state = S) {
  const info = canEquip(item, slot, state);
  if (!info) return false;
  const slotKey = info.slot;
  const existing = state.equipment[slotKey];
  const existingKey = typeof existing === 'string' ? existing : existing?.typeKey;
  if (existingKey && existingKey !== 'fist') addToInventory(existing, state);
  const { id, ...equipData } = item;
  state.equipment[slotKey] = equipData;
  removeFromInventory(id, state);
  console.log('[equip]', 'slot→', slotKey, 'item→', item.typeKey);
  recomputePlayerTotals(state);
  save?.();
  const payload = { key: item.typeKey, name: item.name, slot: slotKey };
  if (slotKey === 'mainhand') emit('INVENTORY:MAINHAND_CHANGED', payload);
  return payload;
}

export function unequip(slot, state = S) {
  const item = state.equipment[slot];
  if (!item) return;
  const key = typeof item === 'string' ? item : item.typeKey;
  if (key !== 'fist') addToInventory(item, state);
  state.equipment[slot] = null;
  console.log('[equip]', 'slot→', slot, 'item→', 'none');
  recomputePlayerTotals(state);
  save?.();
  const payload = { key: 'fist', name: 'Fists', slot };
  if (slot === 'mainhand') emit('INVENTORY:MAINHAND_CHANGED', payload);
  return payload;
}

