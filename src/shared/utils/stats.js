export function mergeStats(base = {}, ...mods) {
  const out = { ...base };
  for (const mod of mods) {
    if (!mod) continue;
    for (const [k, v] of Object.entries(mod)) {
      if (typeof v !== 'number') continue;
      out[k] = (out[k] || 0) + v;
    }
  }
  return out;
}

export const ATTRIBUTE_KEYS = new Set([
  'physique',
  'mind',
  'agility',
  'comprehension',
  'criticalChance',
  'attackSpeed',
  'cooldownReduction',
  'adventureSpeed',
]);

export function isAttributeStat(stat) {
  return ATTRIBUTE_KEYS.has(stat);
}
