/** @typedef {{
 *  key:string, displayName:string, icon:string,
 *  costQi:number, cooldownMs:number, castTimeMs:number,
 *  tags:string[], requiresWeaponType?:string
 * }} AbilityDef */

/** @type {Record<string, AbilityDef>} */
export const ABILITIES = {
  powerSlash: {
    key: 'powerSlash',
    displayName: 'Power Slash',
    icon: 'pointy-sword',
    costQi: 10,
    cooldownMs: 10_000,
    castTimeMs: 0,
    tags: ['weapon-skill', 'physical'],
    requiresWeaponType: 'sword',
  },
  // Leave other abilities out until you define them.
};
