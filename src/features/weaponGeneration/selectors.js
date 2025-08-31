import { weaponGenerationState } from './state.js';
import { WEAPON_LOOT_TABLES } from '../loot/data/lootTables.weapons.js';
import { generateWeapon } from './logic.js';

export function getGeneratedWeapon(state = weaponGenerationState) {
  return state.generated;
}

function pickWeighted(rows){
  const total = rows.reduce((s, r) => s + r.weight, 0);
  let r = Math.random() * total;
  for (const row of rows) {
    r -= row.weight;
    if (r <= 0) return row;
  }
  return rows[rows.length - 1];
}

function pickQuality(weights = { normal: 80, magic: 15, rare: 5 }) {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[0][0];
}

export function rollWeaponDropForZone(zoneKey){
  const rows = WEAPON_LOOT_TABLES[zoneKey];
  if (!rows || rows.length === 0) return null;

  const row = pickWeighted(rows);
  const qualityKey = row.qualityKey || pickQuality();
  return generateWeapon({
    typeKey: row.typeKey,
    materialKey: row.materialKey,
    qualityKey,
  });
}
