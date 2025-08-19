import { ZONES } from './zones.js';
import { generateWeapon } from '../game/systems/weaponGenerator.js';

/** @typedef {{ typeKey:string, materialKey?:string, weight:number }} WeaponLootRow */

/** Minimal v1: starting zone only */
const TABLES /** @type {Record<string, WeaponLootRow[]>} */ = {
  [ZONES.STARTING]: [
    // v1 guarantee: only Iron Sword can drop here
    { typeKey: 'sword', materialKey: 'iron', weight: 100 },
  ],
  // other zones → add later
};

function pickWeighted(rows){
  const total = rows.reduce((s, r) => s + r.weight, 0);
  let r = Math.random() * total;
  for (const row of rows) {
    r -= row.weight;
    if (r <= 0) return row;
  }
  return rows[rows.length - 1];
}

/**
 * Roll a single weapon drop for the given zone.
 * Returns a generated weapon item or null (no drop).
 */
export function rollWeaponDropForZone(zoneKey){
  const rows = TABLES[zoneKey];
  if (!rows || rows.length === 0) return null;

  const row = pickWeighted(rows);
  return generateWeapon({
    typeKey: row.typeKey,
    materialKey: row.materialKey, // naming only in v1, stats come from type
  });
}
