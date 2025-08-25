import { initHp } from '../../shared/utils/hp.js';
import { WEAPONS, WEAPON_CONFIG, WEAPON_FLAGS } from '../weaponGeneration/data/weapons.js'; // WEAPONS-INTEGRATION
import { onPhysicalHit } from '../../engine/combat/stun.ts';

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
  if (incoming <= 0) return 0;
  const shield = target?.shield;
  if (!shield || shield.current <= 0) return incoming;
  const absorbed = Math.min(shield.current, incoming);
  shield.current -= absorbed;
  return incoming - absorbed;
}

/** Returns the mitigated physical damage AFTER armor (integer). */
export function applyArmor(rawPhysDamage, armor) {
  if (rawPhysDamage <= 0 || armor <= 0) return Math.max(0, Math.round(rawPhysDamage));

  const denom = armor + ARMOR_K * rawPhysDamage;
  const mit = Math.min(ARMOR_CAP, Math.max(0, armor / Math.max(1, denom)));
  const after = rawPhysDamage * (1 - mit);
  const rounded = Math.round(after);
  return Math.max(MIN_POST_ARMOR, rounded);
}

export function initializeFight(enemy) {
  const { hp: enemyHP, hpMax: enemyMax } = initHp(enemy.hp || 0);
  const atk = Math.round(enemy.atk ?? enemy.attack ?? 0);
  const armor = Math.round(enemy.armor ?? enemy.def ?? 0);
  return { enemyHP, enemyMax, atk, armor };
}

export function applyWeaponDamage(base, weapon = 'fist') {
  if (!WEAPON_FLAGS[weapon] || weapon === 'fist') return base;
  const config = WEAPON_CONFIG[weapon];
  const modified = Math.round(base * (config.damageMultiplier ?? 1));
  console.log('[weapon]', 'damage', { weapon, base, modified });
  return modified;
}

export function applyResists(damage, element, target) {
  if (!element || !target?.resists) return damage;
  const resist = target.resists[element] ?? 0;
  return damage * (1 - resist);
}

export function processAttack(currentHP, damage, options = {}) {
  const { element, target, type, onDamage, attacker, nowMs } = options;
  let adjusted = applyResists(damage, element, target);
  if (type === 'physical') {
    const armor = target?.stats?.armor ?? target?.armor ?? 0;
    adjusted = applyArmor(adjusted, armor);
  }
  adjusted = routeDamageThroughQiShield(adjusted, target);
  const final = Math.max(0, Math.round(adjusted));
  if (type === 'physical') {
    onPhysicalHit(attacker, target, final, nowMs || Date.now());
  }
  if (typeof onDamage === 'function') onDamage(final);
  return Math.max(0, Math.round(currentHP - final));
}

