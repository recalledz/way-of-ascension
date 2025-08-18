/** Minimal stub. Materials don’t affect stats yet.
 *  They exist only for naming and for future location-tied drops.
 */

/** @typedef {{ key:string, displayName:string }} MaterialStub */

/** @type {Record<string, MaterialStub>} */
export const MATERIALS_STUB = {
  iron:   { key:'iron', displayName:'Iron' },
  steel:  { key:'steel', displayName:'Steel' },
  bronze: { key:'bronze', displayName:'Bronze' },
  jade:   { key:'jade', displayName:'Jade' },
  obsidian:{ key:'obsidian', displayName:'Obsidian' },
  spiritwood:{ key:'spiritwood', displayName:'Spiritwood' },
};

/** Later: map drop locations → allowed materials */
export function getMaterialForDropLocation(/* locationKey */) {
  // TODO: return a material key based on zone/location rules.
  return 'iron';
}
