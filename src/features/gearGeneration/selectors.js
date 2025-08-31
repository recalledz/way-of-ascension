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

export function rollGearDropForZone(zoneKey) {
  const rows = GEAR_LOOT_TABLES[zoneKey];
  if (!rows || !rows.length) return null;
  const row = pickWeighted(rows);
  if (Math.random() > (row.chance ?? 1)) return null;
  let gear = generateGear({ baseKey: row.baseKey, materialKey: row.materialKey, qualityKey: row.qualityKey });
  if (Math.random() < 0.1) {
    gear = generateCultivationGear(gear, zoneKey);
  }
  return gear;
}
