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
  let attackSpeedPct = 0;
  let critChance = 0;
  let critMult = 0;
  let hpBonus = 0;
  const resists = {};
  const damagePct = {};

  const equipped = Object.values(player.equipment || {});
  for (const item of equipped) {
    if (!item) continue;
    if (item.protection) {
      armor += item.protection.armor || 0;
      dodge += item.protection.dodge || 0;
      shieldMax += item.protection.qiShield || 0;
      if (item.protection.resists) {
        for (const [elem, val] of Object.entries(item.protection.resists)) {
          resists[elem] = (resists[elem] || 0) + val;
        }
      }
    }
    if (item.offense) accuracy += item.offense.accuracy || 0;
    if (item.shield?.max) shieldMax += item.shield.max; // legacy support
    if (item.stats) {
      if (item.stats.accuracy) accuracy += item.stats.accuracy; // legacy support
      if (item.stats.dodge) dodge += item.stats.dodge; // legacy support
      if (item.stats.hp) hpBonus += item.stats.hp;
      if (item.stats.hpMax) hpBonus += item.stats.hpMax;
      if (item.stats.attackSpeedPct) attackSpeedPct += item.stats.attackSpeedPct;
      if (item.stats.attackRatePct) attackSpeedPct += item.stats.attackRatePct;
      if (item.stats.criticalChance) critChance += item.stats.criticalChance;
      if (item.stats.critChancePct) critChance += item.stats.critChancePct / 100;
      if (item.stats.critDamagePct) critMult += item.stats.critDamagePct / 100;
      if (item.stats.critMult) critMult += item.stats.critMult;
      for (const [k, v] of Object.entries(item.stats)) {
        if (k.endsWith('DamagePct')) {
          const elem = k === 'physicalDamagePct' ? 'physical' : k.replace('DamagePct', '');
          damagePct[elem] = (damagePct[elem] || 0) + v / 100;
        } else if (k.endsWith('ResistPct')) {
          const elem = k.replace('ResistPct', '');
          resists[elem] = (resists[elem] || 0) + v / 100;
        }
      }
    }
    if (item.bonuses) {
      foundationMult += item.bonuses.foundationMult || 0;
      breakthroughBonus += item.bonuses.breakthroughBonus || 0;
      qiRegenMult += item.bonuses.qiRegenMult || 0;
      dropRateMult += item.bonuses.dropRateMult || 0;
      attackSpeedPct += item.bonuses.attackRatePct || item.bonuses.attackSpeedPct || 0;
      if (typeof item.bonuses.critChance === 'number') critChance += item.bonuses.critChance;
      if (typeof item.bonuses.critChancePct === 'number')
        critChance += item.bonuses.critChancePct / 100;
      if (typeof item.bonuses.critDamagePct === 'number')
        critMult += item.bonuses.critDamagePct / 100;
      if (typeof item.bonuses.critMult === 'number') critMult += item.bonuses.critMult;
      if (typeof item.bonuses.hp === 'number') hpBonus += item.bonuses.hp;
      if (typeof item.bonuses.hpMax === 'number') hpBonus += item.bonuses.hpMax;
      for (const [k, v] of Object.entries(item.bonuses)) {
        if (k.endsWith('DamagePct')) {
          const elem = k === 'physicalDamagePct' ? 'physical' : k.replace('DamagePct', '');
          damagePct[elem] = (damagePct[elem] || 0) + v / 100;
        } else if (k.endsWith('ResistPct')) {
          const elem = k.replace('ResistPct', '');
          resists[elem] = (resists[elem] || 0) + v / 100;
        }
      }
    }
  }

  player.gearStats = {
    armor,
    accuracy,
    dodge,
    hp: hpBonus,
    attackSpeedPct,
    critChance,
    critMult,
    resists,
  };
  player.gearDamagePct = damagePct;

  player.derivedStats = player.derivedStats || {};
  const baseArmor = calcBaseArmor(player);
  player.derivedStats.armor = armor + baseArmor;
  player.derivedStats.accuracy = ACCURACY_BASE + accuracy;
  player.derivedStats.dodge = DODGE_BASE + dodge;
  player.resists = resists;
  player.shield = player.shield || { current: 0, max: 0 };
  player.attributes = player.attributes || {};
  const mind = player.attributes.mind || 0;
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
    attackRatePct: attackSpeedPct,
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
      if (slot && /^food[1-5]$/.test(slot)) return { slot };
      for (let i = 1; i <= 5; i++) {
        const key = `food${i}`;
        if (!state.equipment?.[key]) return { slot: key };
      }
      return { slot: 'food1' };
    case 'foot':
      return { slot: 'foot' };
    case 'ring':
      // rings occupy two dedicated slots
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
