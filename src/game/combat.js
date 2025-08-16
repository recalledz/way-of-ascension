import { initHp } from './helpers.js';
import { WEAPON_CONFIG, WEAPON_FLAGS } from '../data/weapons.js'; // WEAPONS-INTEGRATION

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

export function processAttack(currentHP, damage) {
  return Math.max(0, Math.round(currentHP - damage));
}

// CHANGELOG: Added weapon damage calculation.

