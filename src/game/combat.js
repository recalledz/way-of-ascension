import { initHp } from './helpers.js';
import { WEAPONS, WEAPON_CONFIG, WEAPON_FLAGS } from '../data/weapon.legacy.js'; // WEAPONS-INTEGRATION

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
  const { element, target } = options;
  const adjusted = applyResists(damage, element, target);
  return Math.max(0, Math.round(currentHP - adjusted));
}

export function getEquippedWeapon(state) {
  // WEAPONS-INTEGRATION: respect feature flag and invalid keys
  if (!state.flags?.weaponsEnabled) return 'fist';
  const eq = state.equipment?.mainhand;
  const key = typeof eq === 'string' ? eq : eq?.key;
  return WEAPONS[key] ? key : 'fist';
}

