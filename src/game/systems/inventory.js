import { S, save } from '../state.js';
import { WEAPONS } from '../../data/weapons.js';

// EQUIP-CHAR-UI: basic inventory helpers
export function recomputePlayerTotals(player = S) {
  let armor = 0;
  let accuracy = 0;
  let dodge = 0;
  let shieldMax = 0;
  const equipped = Object.values(player.equipment || {});
  for (const item of equipped) {
    if (item && item.defense?.armor) armor += item.defense.armor;
    if (item && item.shield?.max) shieldMax += item.shield.max;
    if (item && item.stats?.accuracy) accuracy += item.stats.accuracy;
    if (item && item.stats?.dodge) dodge += item.stats.dodge;
  }
  player.stats = player.stats || {};
  player.stats.armor = armor;
  player.stats.accuracy = accuracy;
  player.stats.dodge = dodge;
  player.shield = player.shield || { current: 0, max: 0 };
  const mind = player.stats.mind || 0;
  const shieldMult = 1 + mind * 0.06;
  player.shield.max = Math.round(shieldMax * shieldMult);
  player.shield.current = Math.min(player.shield.current, player.shield.max);
}

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
  const existingKey = typeof existing === 'string' ? existing : existing?.key;
  if (existingKey && existingKey !== 'fist') addToInventory(existing);
  const { id, ...equipData } = item;
  S.equipment[slot] = equipData;
  removeFromInventory(id);
  console.log('[equip]', 'slot→', slot, 'item→', item.key);
  if (slot === 'mainhand') {
    const hud = document.getElementById('currentWeapon');
    if (hud) hud.textContent = WEAPONS[item.key]?.displayName || item.key;
    const chip = document.getElementById('weaponName');
    if (chip) chip.textContent = WEAPONS[item.key]?.displayName || item.key;
  }
  recomputePlayerTotals();
  save?.();
  return true;
}

export function unequip(slot) {
  const item = S.equipment[slot];
  if (!item) return;
  const key = typeof item === 'string' ? item : item.key;
  if (key !== 'fist') addToInventory(item);
  S.equipment[slot] = null;
  console.log('[equip]', 'slot→', slot, 'item→', 'none');
  if (slot === 'mainhand') {
    const hud = document.getElementById('currentWeapon');
    if (hud) hud.textContent = 'Fists';
    const chip = document.getElementById('weaponName');
    if (chip) chip.textContent = 'fist';
  }
  recomputePlayerTotals();
  save?.();
}
