/** @typedef {{
 *  key:string, displayName:string, icon:string,
 *  costQi:number, cooldownMs:number, castTimeMs:number,
 *  kind:'active', tags:string[], requiresWeaponTypeKey?:string
 * }} AbilityDef */

/** @type {Record<string, AbilityDef>} */
export const ABILITIES = {
  powerSlash: {
    key:'powerSlash',
    displayName:'Power Slash',
    icon:'pointy-sword',
    costQi:10, cooldownMs:10_000, castTimeMs:0,
    kind:'active', tags:['physical'], requiresWeaponTypeKey:'sword',
  },
  // Leave other abilities out until you define them.
};
