import { ACCURACY_BASE, DODGE_BASE, chanceToHit } from '../../features/combat/hit.js';
import { BASELINE_HP } from './baseline.js';

export function drFromArmor(armor = 0) {
  if (armor <= 0) return 0;
  return armor / (armor + 100);
}

export function dEhpFromHP(hp = 0, dr = 0) {
  if (hp <= 0) return 0;
  const baseHp = BASELINE_HP || 1;
  if (baseHp <= 0) return 0;
  const ehp = hp / (1 - dr);
  return ehp / baseHp - 1;
}

export function dEhpFromDodge(dodge = DODGE_BASE, accuracy = ACCURACY_BASE) {
  const baseHit = chanceToHit(accuracy, DODGE_BASE);
  const newHit = chanceToHit(accuracy, dodge);
  return baseHit / newHit - 1;
}

export function dEhpFromRes(res = 0) {
  if (res <= 0) return 0;
  if (res >= 1) return Infinity;
  return 1 / (1 - res) - 1;
}

export function dEhpFromQiRegenPct(pct = 0) {
  return pct / 100;
}

export function dEhpFromMaxQiPct(pct = 0) {
  return pct / 100;
}
