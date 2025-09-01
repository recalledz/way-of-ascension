import { ZONES } from '../../adventure/data/zoneIds.js';

/** @typedef {{ typeKey:string, materialKey?:string, weight:number }} WeaponLootRow */

/** Minimal v1: starting zone only */
export const WEAPON_LOOT_TABLES /** @type {Record<string, WeaponLootRow[]>} */ = {
  [ZONES.STARTING]: [
    // Early sample weapons for testing – rough weighting only
    { typeKey: 'straightSword', materialKey: 'iron', weight: 14 },
    { typeKey: 'crudeDagger', materialKey: 'iron', weight: 10 },
    { typeKey: 'crudeRapier', materialKey: 'iron', weight: 10 },
    { typeKey: 'crudeHammer', materialKey: 'bronze', weight: 8 },
    { typeKey: 'crudeBludgeon', materialKey: 'bronze', weight: 8 },
    { typeKey: 'crudeAxe', materialKey: 'iron', weight: 8 },
    { typeKey: 'spear', materialKey: 'bronze', weight: 10 },
    { typeKey: 'dimFocus', materialKey: 'spiritwood', weight: 9 },
    { typeKey: 'starFocus', materialKey: 'spiritwood', weight: 8 },
    { typeKey: 'crudeKnuckles', materialKey: 'iron', weight: 7 },
    { typeKey: 'crudeNunchaku', materialKey: 'spiritwood', weight: 5 },
    { typeKey: 'tameNunchaku', materialKey: 'spiritwood', weight: 3 },
  ],
  // other zones → add later
};
