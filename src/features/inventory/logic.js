// Inventory feature logic helpers

// Recalculate derived player stats based on equipped items
import { ACCURACY_BASE, DODGE_BASE } from '../combat/hit.js';
import { calcArmor as calcBaseArmor } from '../progression/selectors.js';
export function recomputePlayerTotals(player) {
  let armor = 0;
  let accuracy = 0;
  let dodge = 0;
  let shieldMax = 0;
  let foundationMult = 0;
  let breakthroughBonus = 0;
  let qiRegenMult = 0;
  let dropRateMult = 0;
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
    if (item.bonuses) {
      foundationMult += item.bonuses.foundationMult || 0;
      breakthroughBonus += item.bonuses.breakthroughBonus || 0;
      qiRegenMult += item.bonuses.qiRegenMult || 0;
      dropRateMult += item.bonuses.dropRateMult || 0;
    }
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
  // Fully refresh the player's Qi shield whenever equipment changes so that
  // newly equipped gear providing shield protection immediately applies its
  // full value. Previously the shield's current value was simply clamped to
  // the new maximum, leaving it at zero after equipping items like the
  // Cotton Robe. This caused the Qi shield to appear inactive until it was
  // refilled through other means.
  player.shield.current = player.shield.max;
  player.gearBonuses = {
    foundationMult,
    breakthroughBonus,
    qiRegenMult,
    dropRateMult,
  };
}

// Determine if an item can be equipped and in which slot
export function canEquip(item, slot = null, state = {}) {
  if (!item) return false;
  switch (item.type) {
    case 'weapon':
      return { slot: 'mainhand' };
    case 'armor':
      if (item.slot === 'head' || item.slot === 'body') return { slot: item.slot };
      break;
    case 'food':
      return { slot: 'food' };
    case 'foot':
      return { slot: 'foot' };
    case 'ring':
      if (slot === 'ring1' || slot === 'ring2') return { slot };
      if (!state.equipment?.ring1) return { slot: 'ring1' };
      if (!state.equipment?.ring2) return { slot: 'ring2' };
      return { slot: 'ring1' };
    case 'talisman':
      if (slot === 'talisman1' || slot === 'talisman2') return { slot };
      if (!state.equipment?.talisman1) return { slot: 'talisman1' };
      if (!state.equipment?.talisman2) return { slot: 'talisman2' };
      return { slot: 'talisman1' };
  }
  return false;
}
