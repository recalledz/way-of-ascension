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
    desc: 'Slash for 130% weapon damage and heal for 5 HP.',
  },
  
  palmStrike: {
    key: 'palmStrike',
    displayName: 'Palm Strike',
    icon: 'arcticons:palmpay',
    costQi: 0,
    cooldownMs: 0,
    castTimeMs: 0,
    tags: ['weapon-skill', 'physical'],
    desc: 'A quick strike using your weapon.',
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
    desc: 'Strike with your weapon and heavily stun the enemy.',
  },
  seventyFive: {
    key: 'seventyFive',
    displayName: '75%',
    icon: 'game-icons:mighty-force',
    costQi: 0,
    cooldownMs: 0,
    castTimeMs: 0,
    tags: ['special'],
    desc: 'Instantly defeat the enemy and fully restore yourself.',
  },
  fireball: {
    key: 'fireball',
    displayName: 'Fireball',
    icon: 'game-icons:fireball',
    costQi: 50,
    cooldownMs: 0,
    castTimeMs: 3_000,
    tags: ['spell', 'fire'],
    desc: 'Hurl a fireball dealing fire damage based on manual level.',
  },
  lightningStep: {
    key: 'lightningStep',
    displayName: 'Lightning Step',
    icon: 'game-icons:lightning',
    costQi: 30,
    cooldownMs: 30_000,
    castTimeMs: 500,
    tags: ['buff', 'metal'],
    desc: 'Temporarily increase attack speed and damage.',
  },
  // Leave other abilities out until you define them.
};
