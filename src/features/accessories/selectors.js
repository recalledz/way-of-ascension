import { generateRing } from './logic.js';
import { RING_LOOT_TABLES } from '../loot/data/lootTables.rings.js';
import { S } from '../../shared/state.js';
import { rollRarity } from '../loot/qualityWeights.js';

function pickWeighted(rows) {
  const total = rows.reduce((s, r) => s + (r.weight || 0), 0);
  let r = Math.random() * total;
  for (const row of rows) {
    r -= row.weight || 0;
    if (r <= 0) return row;
  }
  return rows[rows.length - 1];
}

export function rollRingDropForZone(zoneKey) {
  const rows = RING_LOOT_TABLES[zoneKey];
  if (!rows || !rows.length) return null;
  const row = pickWeighted(rows);
  const dropMult = 1 + (S.gearBonuses?.dropRateMult || 0);
  if (Math.random() > Math.min(1, (row.chance ?? 1) * dropMult)) return null;
  const rarity = rollRarity();
  return generateRing(row.key, rarity);
}
