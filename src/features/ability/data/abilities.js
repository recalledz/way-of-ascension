/** @typedef {{
 *  key:string, displayName:string, icon:string,
 *  costQi:number, cooldownMs:number, castTimeMs:number,
 *  tags:string[], requiresWeaponClass?:string
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
    requiresWeaponClass: 'sword',
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
    requiresWeaponClass: 'palm',
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
  fireball: {
    key: 'fireball',
    displayName: 'Fireball',
    icon: 'game-icons:fireball',
    costQi: 50,
    cooldownMs: 0,
    castTimeMs: 3_000,
    tags: ['spell', 'fire']
  },
  lightningStep: {
    key: 'lightningStep',
    displayName: 'Lightning Step',
    icon: 'game-icons:lightning',
    costQi: 30,
    cooldownMs: 30_000,
    castTimeMs: 500,
    tags: ['buff', 'metal']
  },
  // Leave other abilities out until you define them.
};
