import { ENEMY_DATA } from '../features/adventure/data/enemies.js';
import { drFromArmor, dEhpFromHP, dEhpFromRes, dEhpFromDodge } from '../lib/power/ehp.js';
import { DODGE_BASE } from '../features/combat/hit.js';

export const W_O = 0.6;
export const W_D = 0.4;

export const BASELINE_ENEMY_KEY = 'Forest Rabbit';

export function computeEnemyEHP(enemy = {}) {
  const hp = enemy.hpMax ?? enemy.hp ?? 0;
  const armor = enemy.armor ?? 0;
  const dodge = (enemy.stats?.dodge ?? enemy.dodge ?? 0) + DODGE_BASE;
  const resists = enemy.resists || {};
  const dr = drFromArmor(armor);
  let ehpPct = dEhpFromHP(hp, dr);
  for (const val of Object.values(resists)) {
    ehpPct += dEhpFromRes(val);
  }
  ehpPct += dEhpFromDodge(dodge);
  return (1 + ehpPct) * 100;
}

const BASELINE_ENEMY = ENEMY_DATA[BASELINE_ENEMY_KEY] || {};
const baselineEhp = computeEnemyEHP(BASELINE_ENEMY);
const baselineDps = (BASELINE_ENEMY.attack || 0) * (BASELINE_ENEMY.attackRate || 0);

export const BASELINE_EHP = baselineEhp > 0 ? baselineEhp : 1;
export const BASELINE_DPS = baselineDps > 0 ? baselineDps : 1;
