export function rollQualityKey(weights = { basic: 80, refined: 15, superior: 5 }, rng = Math.random) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[0][0];
}

export function rollRarity(
  weights = { normal: 80, magic: 18, rare: 2 },
  rng = Math.random,
) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[0][0];
}
