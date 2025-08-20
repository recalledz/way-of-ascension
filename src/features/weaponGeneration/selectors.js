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

export function rollWeaponDropForZone(zoneKey){
  const rows = WEAPON_LOOT_TABLES[zoneKey];
  if (!rows || rows.length === 0) return null;

  const row = pickWeighted(rows);
  return generateWeapon({
    typeKey: row.typeKey,
    materialKey: row.materialKey,
  });
}
