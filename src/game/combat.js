import { initHp } from './helpers.js';
import { WEAPONS, WEAPON_CONFIG, WEAPON_FLAGS } from '../data/weapons.js'; // WEAPONS-INTEGRATION
import { getProficiency } from './systems/proficiency.js';

/** Tunables */
export const ARMOR_K = 10;           // how "strong" armor is vs damage size
export const ARMOR_CAP = 0.90;       // 90% maximum mitigation
export const MIN_POST_ARMOR = 0;     // allow 0; set to 1 if you prefer "always chip"

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
  const def = Math.round(enemy.def ?? enemy.defense ?? 0);
  return { enemyHP, enemyMax, atk, def };
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
  const { element, target, type, onDamage } = options;
  let adjusted = applyResists(damage, element, target);
  if (type === 'physical') {
    const armor = target?.stats?.armor ?? target?.armor ?? target?.defense ?? 0;
    adjusted = applyArmor(adjusted, armor);
  }
  const final = Math.max(0, Math.round(adjusted));
  if (typeof onDamage === 'function') onDamage(final);
  return Math.max(0, Math.round(currentHP - final));
}

export function getEquippedWeapon(state) {
  // WEAPONS-INTEGRATION: respect feature flag and invalid keys
  if (!state.flags?.weaponsEnabled) return WEAPONS.fist;
  const eq = state.equipment?.mainhand;
  const key = typeof eq === 'string' ? eq : eq?.key;
  return WEAPONS[key] || WEAPONS.fist;
}

