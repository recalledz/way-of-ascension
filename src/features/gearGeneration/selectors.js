import { generateGear, generateCultivationGear } from './logic.js';
import { GEAR_LOOT_TABLES } from '../loot/data/lootTables.gear.js';

function pickWeighted(rows) {
  const total = rows.reduce((s, r) => s + (r.weight || 0), 0);
  let r = Math.random() * total;
  for (const row of rows) {
    r -= row.weight || 0;
    if (r <= 0) return row;
  }
  return rows[rows.length - 1];
}

function pickQuality(weights = { basic: 80, refined: 15, superior: 5 }) {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[0][0];
}

export function rollGearDropForZone(zoneKey) {
  const rows = GEAR_LOOT_TABLES[zoneKey];
  if (!rows || !rows.length) return null;
  const row = pickWeighted(rows);
  if (Math.random() > (row.chance ?? 1)) return null;
  const qualityKey = row.qualityKey || pickQuality();
  let gear = generateGear({ baseKey: row.baseKey, materialKey: row.materialKey, qualityKey });
  if (Math.random() < 0.1) {
    gear = generateCultivationGear(gear, zoneKey);
  }
  return gear;
}
