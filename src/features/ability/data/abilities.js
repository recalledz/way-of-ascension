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
  
  palmStrike: {
    key: 'palmStrike',
    displayName: 'Palm Strike',
    icon: 'ph:hand-palm-thin',
    costQi: 0,
    cooldownMs: 0,
    castTimeMs: 0,
    tags: ['weapon-skill', 'physical'],
  },
    
  flowingPalm: {
    key: 'flowingPalm',
    displayName: 'Flowing Palm',
    icon: 'game-icons:open-palm',
    costQi: 0,
    cooldownMs: 5_000,
    castTimeMs: 0,
    tags: ['martial', 'physical'],
    requiresWeaponType: 'palm',
  },
  stoneFist: {
    key: 'stoneFist',
    displayName: 'Stone Fist',
    icon: 'game-icons:stone-punch',
    costQi: 20,
    cooldownMs: 4_000,
    castTimeMs: 0,
    tags: ['martial', 'earth'],
    requiresWeaponType: 'fist',
  },
  seventyFive: {
    key: 'seventyFive',
    displayName: '75%',
    icon: 'game-icons:mighty-force',
    costQi: 0,
    cooldownMs: 0,
    castTimeMs: 0,
    tags: ['special']
  },
  // Leave other abilities out until you define them.
};
