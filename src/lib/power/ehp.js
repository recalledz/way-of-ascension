export function drFromArmor(armor = 0, k = 100) {
  const a = Number(armor) || 0;
  if (a <= 0) return 0;
  return a / (a + k);
}

export function dEhpFromHP(hp = 0, base = 100) {
  const h = Number(hp) || 0;
  if (base <= 0) return 0;
  return (h - base) / base;
}

export function dEhpFromDodge(dodge = 0) {
  const d = Math.max(0, Math.min(0.95, Number(dodge) || 0));
  return d / (1 - d);
}

export function dEhpFromRes(res = 0) {
  const r = Math.max(0, Math.min(0.95, Number(res) || 0));
  return r / (1 - r);
}

export const dEhpFromQiRegenPct = pct => Number(pct) || 0;
export const dEhpFromMaxQiPct = pct => Number(pct) || 0;
