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
    } else if (
      mod.element &&
      typeof mod.lane === 'string' &&
      mod.lane.endsWith('Pct') &&
      typeof mod.value === 'number'
    ) {
      const elem = mod.element;
      result.elems[elem] = (result.elems[elem] || 0) * (1 + mod.value);
    } else if (
      mod.element &&
      typeof mod.lane === 'string' &&
      mod.lane.endsWith('Flat') &&
      mod.range
    ) {
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
    typeMults = {},
    globalMult = 1,
    treeMult = 1,
    proficiencyMult = 1,
    manualMult = 1,
    tempMult = 1,
  } = options;

  const w = weapon && weapon.key ? weapon : WEAPONS[weapon] || WEAPONS.fist;
  const scaled = applyWeaponDamage(profile, w, attacker, typeMults);

  const stats = w?.stats || {};
  if (typeof stats.physDamagePct === 'number') {
    scaled.phys *= 1 + stats.physDamagePct;
  }
  if (typeof stats.damageTransferPct === 'number') {
    const elem = stats.damageTransferElement;
    if (elem) {
      const transferred = scaled.phys * stats.damageTransferPct;
      scaled.phys -= transferred;
      scaled.elems[elem] = (scaled.elems[elem] || 0) + transferred;
    }
  }

  const baseDamageMult = 1 + ((attacker?.stats?.damagePct || 0) / 100);
  const physDamageMult = 1 + ((attacker?.stats?.physDamagePct || 0) / 100);
  scaled.phys *= baseDamageMult * physDamageMult;
  for (const elem in scaled.elems) {
    scaled.elems[elem] *= baseDamageMult;
  }

  const components = { phys: 0, elems: {} };

  if (scaled.phys > 0) {
    let amt = applyArmor(scaled.phys, Number(target?.stats?.armor ?? target?.armor ?? 0) || 0);
    amt = routeDamageThroughQiShield(amt, target);
    components.phys = Math.max(0, Math.round(amt));
    if (components.phys > 0) {
      onPhysicalHit(attacker, target, components.phys, nowMs || Date.now());
    }
  }

  for (const [elem, val] of Object.entries(scaled.elems)) {
    let amt = applyResists(val, elem, target);
    amt = routeDamageThroughQiShield(amt, target);
    components.elems[elem] = Math.max(0, Math.round(amt));
  }

  let total = components.phys;
  for (const v of Object.values(components.elems)) total += v;

  total = Math.round(
    total * globalMult * treeMult * proficiencyMult * manualMult * tempMult
  );

  if (typeof onDamage === 'function') onDamage(total, components);

  return { total, components };
}

