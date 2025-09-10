/** @typedef {{
 *  key:string, displayName:string, icon:string,
 *  costQi:number, cooldownMs:number, castTimeMs:number,
 *  description:string,
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
    description: 'A heavy slash that deals extra damage and heals you for a small amount.',
    tags: ['weapon-skill', 'physical'],
    requiresWeaponClass: 'sword',
  },
  
  palmStrike: {
    key: 'palmStrike',
    displayName: 'Palm Strike',
    icon: 'arcticons:palmpay',
    costQi: 0,
    cooldownMs: 0,
    castTimeMs: 0,
    description: 'A simple palm attack that deals your weapon\'s damage.',
    tags: ['weapon-skill', 'physical'],
  },
    
  flowingPalm: {
    key: 'flowingPalm',
    displayName: 'Flowing Palm',
    icon: 'game-icons:open-palm',
    costQi: 0,
    cooldownMs: 5_000,
    castTimeMs: 0,
    description: 'Strikes with stunning force, dealing weapon damage and applying a brief stun.',
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
    description: 'A mysterious technique that instantly defeats your foe and restores you.',
    tags: ['special']
  },
  fireball: {
    key: 'fireball',
    displayName: 'Fireball',
    icon: 'game-icons:fireball',
    costQi: 50,
    cooldownMs: 0,
    castTimeMs: 3_000,
    description: 'Conjures a blazing fireball that deals heavy fire damage.',
    tags: ['spell', 'fire']
  },
  lightningStep: {
    key: 'lightningStep',
    displayName: 'Lightning Step',
    icon: 'game-icons:lightning',
    costQi: 30,
    cooldownMs: 30_000,
    castTimeMs: 500,
    description: 'Empowers you with lightning, boosting attack speed and damage for a short time.',
    tags: ['buff', 'metal']
  },
  // Leave other abilities out until you define them.
};
