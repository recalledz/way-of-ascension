import { ZONES } from '../../adventure/data/zoneIds.js';

/** @typedef {{ typeKey:string, materialKey?:string, weight:number }} WeaponLootRow */

/** Minimal v1: starting zone only */
export const WEAPON_LOOT_TABLES /** @type {Record<string, WeaponLootRow[]>} */ = {
  [ZONES.STARTING]: [
    // v1 guarantee: only Iron Sword can drop here; quality determined by weights
    { typeKey: 'sword', materialKey: 'iron', weight: 100 },
  ],
  // other zones → add later
};
