import { ENEMY_DATA } from '../../features/adventure/data/enemies.js';

export const BASELINE_ENEMY_KEY = 'Forest Rabbit';

function toNumber(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const baselineEnemy = ENEMY_DATA?.[BASELINE_ENEMY_KEY] ?? {};

const rawHp = toNumber(baselineEnemy.hpMax ?? baselineEnemy.hp, 0);
export const BASELINE_HP = rawHp > 0 ? rawHp : 1;

const rawAttack = toNumber(baselineEnemy.attack, 0);
const rawRate = toNumber(baselineEnemy.attackRate, 1) || 1;
const rawDps = rawAttack * rawRate;
export const BASELINE_DPS = rawDps > 0 ? rawDps : 1;

export function getBaselineEnemy() {
  return baselineEnemy;
}

