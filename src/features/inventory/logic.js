// Inventory feature logic helpers

// Recalculate derived player stats based on equipped items
import { ACCURACY_BASE, DODGE_BASE } from '../combat/hit.js';
import { calcArmor as calcBaseArmor } from '../progression/selectors.js';
export function recomputePlayerTotals(player) {
  let armor = 0;
  let accuracy = 0;
  let dodge = 0;
  let shieldMax = 0;
  const equipped = Object.values(player.equipment || {});
  for (const item of equipped) {
    if (!item) continue;
    if (item.protection) {
      armor += item.protection.armor || 0;
      dodge += item.protection.dodge || 0;
      shieldMax += item.protection.qiShield || 0;
    }
    if (item.offense) accuracy += item.offense.accuracy || 0;
    if (item.shield?.max) shieldMax += item.shield.max; // legacy support
    if (item.stats?.accuracy) accuracy += item.stats.accuracy; // legacy support
    if (item.stats?.dodge) dodge += item.stats.dodge; // legacy support
  }
  player.stats = player.stats || {};
  const baseArmor = calcBaseArmor(player);
  player.stats.armor = armor + baseArmor;
  player.stats.accuracy = ACCURACY_BASE + accuracy;
  player.stats.dodge = DODGE_BASE + dodge;
  player.shield = player.shield || { current: 0, max: 0 };
  const mind = player.stats.mind || 0;
  const shieldMult = 1 + mind * 0.06;
  player.shield.max = Math.round(shieldMax * shieldMult);
  player.shield.current = Math.min(player.shield.current, player.shield.max);
}

// Determine if an item can be equipped and in which slot
export function canEquip(item) {
  if (!item) return false;
  switch (item.type) {
    case 'weapon':
      return { slot: 'mainhand' };
    case 'armor':
      if (item.slot === 'head' || item.slot === 'body') return { slot: item.slot };
      break;
    case 'food':
      return { slot: 'food' };
  }
  return false;
}
