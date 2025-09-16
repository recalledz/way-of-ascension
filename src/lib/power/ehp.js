import { ACCURACY_BASE, DODGE_BASE, chanceToHit } from '../../features/combat/hit.js';

export function drFromArmor(armor = 0) {
  if (armor <= 0) return 0;
  return armor / (armor + 100);
}

export function dEhpFromHP(hp = 0, dr = 0) {
  if (hp <= 0) return 0;
  const baseHp = 100;
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

export function effectiveHP({
  hp = 0,
  armor = 0,
  dodge = DODGE_BASE,
  resists = {},
  qiRegenPct = 0,
  maxQiPct = 0,
  accuracy = ACCURACY_BASE,
} = {}) {
  if (hp <= 0) return 0;
  const dr = drFromArmor(armor);
  const denom = 1 - dr;
  if (denom <= 0) return Infinity;
  const baseEhp = hp / denom;
  let bonusPct = 0;
  for (const val of Object.values(resists || {})) {
    bonusPct += dEhpFromRes(val);
  }
  bonusPct += dEhpFromDodge(dodge, accuracy);
  bonusPct += dEhpFromQiRegenPct(qiRegenPct);
  bonusPct += dEhpFromMaxQiPct(maxQiPct);
  return baseEhp * (1 + bonusPct);
}
