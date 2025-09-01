import { weaponGenerationState } from './state.js';
import { WEAPON_LOOT_TABLES } from '../loot/data/lootTables.weapons.js';
import { generateWeapon } from './logic.js';
import { rollQualityKey } from '../loot/qualityWeights.js';
import { pickZoneElement } from '../gearGeneration/imbuement.js';

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

export function rollWeaponDropForZone(zoneKey, stage = 1){
  const rows = WEAPON_LOOT_TABLES[zoneKey];
  if (!rows || rows.length === 0) return null;

  const row = pickWeighted(rows);
  const qualityKey = row.qualityKey || rollQualityKey(row.qualityWeights);
  const imbChance = 0.05 + Math.random() * 0.05;
  const imbuement = Math.random() < imbChance ? { element: pickZoneElement(zoneKey), tier: 1 } : undefined;
  return generateWeapon({
    typeKey: row.typeKey,
    materialKey: row.materialKey,
    qualityKey,
    stage,
    imbuement,
  });
}
