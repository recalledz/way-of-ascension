import { initHp } from './helpers.js';

export function initializeFight(enemy) {
  const { hp: enemyHP, hpMax: enemyMax } = initHp(enemy.hp || 0);
  const atk = Math.round(enemy.atk ?? enemy.attack ?? 0);
  const def = Math.round(enemy.def ?? enemy.defense ?? 0);
  return { enemyHP, enemyMax, atk, def };
}

export function processAttack(currentHP, damage) {
  return Math.max(0, Math.round(currentHP - damage));
}

