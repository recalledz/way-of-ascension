import { initHp } from '../../shared/utils/hp.js';
import { WEAPONS, WEAPON_CONFIG } from '../weaponGeneration/data/weapons.js'; // WEAPONS-INTEGRATION
import { onPhysicalHit } from '../../engine/combat/stun.js';
import { MODIFIERS } from '../gearGeneration/data/modifiers.js';

/** Tunables */
export const ARMOR_K = 10;           // how "strong" armor is vs damage size
export const ARMOR_CAP = 0.90;       // 90% maximum mitigation
export const MIN_POST_ARMOR = 0;     // allow 0; set to 1 if you prefer "always chip"

export const QI_PER_SHIELD_BASE = 2.0;
export const MIND_EFF_PER_POINT = 0.01;
export const MIN_COST_MULT = 0.25;

export function qiCostPerShield(mind) {
  const mult = 1 / (1 + mind * MIND_EFF_PER_POINT);
  const clampedMult = Math.max(MIN_COST_MULT, mult);
  return QI_PER_SHIELD_BASE * clampedMult;
}

export function refillShieldFromQi(entity) {
  if (!entity || entity.autoFillShieldFromQi === false) return { gained: 0, qiSpent: 0 };
  entity.shield = entity.shield || { current: 0, max: 0 };
  const missing = Math.max(0, entity.shield.max - entity.shield.current);
  if (missing === 0) return { gained: 0, qiSpent: 0 };
  const cost = qiCostPerShield(entity.stats?.mind || 0);
  const maxGained = Math.floor((entity.qi || 0) / cost);
  const gained = Math.min(missing, maxGained);
  const spent = gained * cost;
  entity.qi -= spent;
  entity.shield.current += gained;
  return { gained, qiSpent: spent };
}

export function routeDamageThroughQiShield(incoming, target) {
  const dmg = Number(incoming) || 0;
  if (dmg <= 0) return 0;
  const shield = target?.shield;
  if (!shield || shield.current <= 0) return dmg;
  const absorbed = Math.min(shield.current, dmg);
  shield.current -= absorbed;
  return dmg - absorbed;
}

/** Returns the mitigated physical damage AFTER armor (integer). */
export function applyArmor(rawPhysDamage, armor) {
  const dmg = Number(rawPhysDamage) || 0;
  const arm = Number(armor) || 0;
  if (dmg <= 0 || arm <= 0) return Math.max(0, Math.round(dmg));

  const denom = arm + ARMOR_K * dmg;
  const mit = Math.min(ARMOR_CAP, Math.max(0, arm / Math.max(1, denom)));
  const after = dmg * (1 - mit);
  const rounded = Math.round(after);
  return Math.max(MIN_POST_ARMOR, rounded);
}

export function initializeFight(enemy) {
  const { hp: enemyHP, hpMax: enemyMax } = initHp(enemy.hp || 0);
  const atk = Math.round(enemy.atk ?? enemy.attack ?? 0);
  const armor = Math.round(enemy.armor ?? enemy.def ?? 0);
  return { enemyHP, enemyMax, atk, armor };
}

export function applyWeaponDamage(profile = {}, weapon = WEAPONS.fist, attacker = {}, typeMults = {}) {
  const result = {
    phys: Number(profile.phys) || 0,
    elems: { ...(profile.elems || {}) },
  };

  const w = weapon && weapon.key ? weapon : WEAPONS[weapon] || WEAPONS.fist;
  const config = WEAPON_CONFIG[w.key] || {};
  const baseMult = config.damageMultiplier ?? 1;

  result.phys *= baseMult;
  for (const k in result.elems) {
    result.elems[k] *= baseMult;
  }

  for (const key of w.modifiers || []) {
    const mod = MODIFIERS[key];
    if (!mod) continue;
    if (mod.lane === 'damage' && typeof mod.value === 'number') {
      result.phys *= 1 + mod.value;
      for (const k in result.elems) result.elems[k] *= 1 + mod.value;
    } else if (mod.lane === 'physPct' && typeof mod.value === 'number') {
      result.phys *= 1 + mod.value;
    } else if (mod.lane === 'physFlat' && mod.range) {
      const avg = (mod.range.min + mod.range.max) / 2;
      result.phys += avg;
    } else if (mod.element && mod.lane.endsWith('Pct') && typeof mod.value === 'number') {
      const elem = mod.element;
      result.elems[elem] = (result.elems[elem] || 0) * (1 + mod.value);
    } else if (mod.element && mod.lane.endsWith('Flat') && mod.range) {
      const elem = mod.element;
      const avg = (mod.range.min + mod.range.max) / 2;
      result.elems[elem] = (result.elems[elem] || 0) + avg;
    }
  }

  const getMult = key =>
    (typeMults && typeMults[key]) ||
    attacker?.stats?.[`${key}DamageMult`] ||
    attacker?.[`${key}DamageMult`] ||
    1;

  result.phys *= getMult('physical');
  for (const k in result.elems) {
    result.elems[k] *= getMult(k);
  }

  const classMult =
    attacker?.stats?.[`${w.classKey}DamageMult`] ||
    attacker?.[`${w.classKey}DamageMult`] ||
    1;
  const typeMult =
    attacker?.stats?.[`${w.typeKey}DamageMult`] ||
    attacker?.[`${w.typeKey}DamageMult`] ||
    1;

  const weaponMult = classMult * typeMult;
  result.phys *= weaponMult;
  for (const k in result.elems) result.elems[k] *= weaponMult;

  return result;
}

export function applyResists(damage, element, target) {
  const dmg = Number(damage) || 0;
  if (!element || !target?.resists) return dmg;
  const resist = Number(target.resists[element]) || 0;
  return dmg * (1 - resist);
}

export function processAttack(profile, weapon, options = {}) {
  const {
    target,
    onDamage,
    attacker,
    nowMs,
    catPct = {},
    gearPct = {},
    globalPct = 0,
    critChance = 0,
    critMult = 1,
    attackSpeed,
    attackSpeedPct = 0,
    hitChance = 1,
  } = options;

  const w = weapon && weapon.key ? weapon : WEAPONS[weapon] || WEAPONS.fist;
  // Base weapon damage without attacker modifiers
  const scaled = applyWeaponDamage(profile, w);

  const stats = w?.stats || {};
  const weaponPct = {};
  if (typeof stats.physDamagePct === 'number') {
    weaponPct.physical = (weaponPct.physical || 0) + stats.physDamagePct;
  }
  if (typeof stats.damageTransferPct === 'number') {
    const elem = stats.damageTransferElement;
    if (elem) {
      const transferred = scaled.phys * stats.damageTransferPct;
      scaled.phys -= transferred;
      scaled.elems[elem] = (scaled.elems[elem] || 0) + transferred;
    }
  }

  const bucketAdd = (bucket, key, val) => {
    if (!val) return;
    bucket[key] = (bucket[key] || 0) + val;
  };
  const bucketGet = (bucket, key) => (bucket?.all || 0) + (bucket?.[key] || 0);

  // Gear-based bonuses from attacker stats
  const gear = { ...gearPct };
  const atkStats = attacker?.stats || {};
  const globalGear = (atkStats.damagePct || 0) / 100;
  if (globalGear) gear.all = (gear.all || 0) + globalGear;
  const physGear = (atkStats.physDamagePct || 0) / 100;
  if (physGear) bucketAdd(gear, 'physical', physGear);
  for (const elem in scaled.elems) {
    const key = `${elem}DamagePct`;
    const val = (atkStats[key] || 0) / 100;
    if (val) bucketAdd(gear, elem, val);
  }
  const classMult =
    (attacker?.stats?.[`${w.classKey}DamageMult`] ||
      attacker?.[`${w.classKey}DamageMult`] ||
      1) *
    (attacker?.stats?.[`${w.typeKey}DamageMult`] ||
      attacker?.[`${w.typeKey}DamageMult`] ||
      1);
  const classPct = classMult - 1;
  if (classPct) gear.all = (gear.all || 0) + classPct;

  const components = { phys: 0, elems: {} };
  const allElems = new Set(['physical', ...Object.keys(scaled.elems)]);
  const critFactor = 1 + critChance * (critMult - 1);

  for (const elem of allElems) {
    const base = elem === 'physical' ? scaled.phys : scaled.elems[elem] || 0;
    if (base <= 0) {
      if (elem !== 'physical') components.elems[elem] = 0;
      continue;
    }
    const key = elem === 'physical' ? 'physical' : elem;
    const dmg =
      base *
      (1 + bucketGet(weaponPct, key)) *
      (1 + bucketGet(gear, key)) *
      (1 + bucketGet(catPct, key));
    let afterCrit = dmg * critFactor;
    if (elem === 'physical') {
      let amt = applyArmor(
        afterCrit,
        Number(target?.stats?.armor ?? target?.armor ?? 0) || 0
      );
      amt = routeDamageThroughQiShield(amt, target);
      amt = Math.max(0, Math.round(amt));
      components.phys = amt;
      if (amt > 0 && hitChance >= 1) {
        onPhysicalHit(attacker, target, amt, nowMs || Date.now());
      }
    } else {
      let amt = applyResists(afterCrit, elem, target);
      amt = routeDamageThroughQiShield(amt, target);
      amt = Math.max(0, Math.round(amt));
      components.elems[elem] = amt;
    }
  }

  let total = components.phys;
  for (const v of Object.values(components.elems)) total += v;

  const aps =
    attackSpeed !== undefined
      ? attackSpeed
      : (w?.base?.rate || 1) * (1 + (attackSpeedPct + (atkStats.attackRatePct || 0)) / 100);

  total = Math.round(total * (1 + globalPct) * aps * hitChance);

  if (typeof onDamage === 'function' && hitChance >= 1) onDamage(total, components);

  return { total, components };
}

