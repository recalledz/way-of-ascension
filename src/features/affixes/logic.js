import { AFFIXES, AFFIX_KEYS } from './data/affixes.js';

// Weighted distribution for how many affixes an enemy can roll
// The weights sum to 100 for readability
export const AFFIX_COUNT_WEIGHTS = [
  { count: 0, weight: 50 },
  { count: 1, weight: 30 },
  { count: 2, weight: 15 },
  { count: 3, weight: 4 },
  { count: 4, weight: 1 },
];

function rollAffixCount() {
  const total = AFFIX_COUNT_WEIGHTS.reduce((s, r) => s + r.weight, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const row of AFFIX_COUNT_WEIGHTS) {
    acc += row.weight;
    if (r < acc) return row.count;
  }
  return 0;
}

export function applyRandomAffixes(h, count) {
  h.affixes = h.affixes || [];
  const choices = AFFIX_KEYS.filter(k => !h.affixes.includes(k));
  const toApply = count == null ? rollAffixCount() : count;
  for (let i = 0; i < toApply; i++) {
    if (!choices.length) break;
    const idx = Math.floor(Math.random() * choices.length);
    const key = choices.splice(idx, 1)[0];
    h.affixes.push(key);
    const affix = AFFIXES[key];
    if (affix?.apply) affix.apply(h);
  }
  return h.affixes.length;
}

// Future affix-related helpers can be added here

