/** @typedef {{min:number,max:number,rate:number}} BaseDps */
/** @typedef {{physique:number,agility:number,mind:number}} Scales */
/** @typedef {{
 *  key:string, displayName:string, slot:'mainhand',
 *  base: BaseDps, scales: Scales,
 *  tags: ('physical')[]|[],        // only 'physical' or []
 *  signatureAbilityKey?: string    // e.g., 'powerSlash' for swords
 * }} WeaponTypeDef */

/** @type {Record<string, WeaponTypeDef>} */
export const WEAPON_TYPES = {
  sword: {
    key: 'sword',
    displayName: 'Sword',
    slot: 'mainhand',
    base: { min: 4, max: 6, rate: 1.0 },
    scales: { physique: 0.5, agility: 0.4, mind: 0.1 },
    tags: ['physical'],
    signatureAbilityKey: 'powerSlash',
  },
  spear: {
    key: 'spear',
    displayName: 'Spear',
    slot: 'mainhand',
    base: { min: 5, max: 7, rate: 0.9 },
    scales: { physique: 0.45, agility: 0.45, mind: 0.1 },
    tags: ['physical'],
    signatureAbilityKey: 'piercingThrust', // stub for later
  },
  hammer: {
    key: 'hammer',
    displayName: 'Hammer',
    slot: 'mainhand',
    base: { min: 7, max: 10, rate: 0.7 },
    scales: { physique: 0.7, agility: 0.2, mind: 0.1 },
    tags: ['physical'],
    signatureAbilityKey: 'crushingBlow', // stub for later
  },
  nunchaku: {
    key: 'nunchaku',
    displayName: 'Nunchaku',
    slot: 'mainhand',
    base: { min: 2, max: 4, rate: 1.6 },
    scales: { physique: 0.3, agility: 0.6, mind: 0.1 },
    tags: ['physical'],
    signatureAbilityKey: 'flurryStrike', // stub for later
  },
  chakram: {
    key: 'chakram',
    displayName: 'Chakram',
    slot: 'mainhand',
    base: { min: 3, max: 5, rate: 1.2 },
    scales: { physique: 0.25, agility: 0.65, mind: 0.1 },
    tags: ['physical'],
    signatureAbilityKey: 'ricochetBlade', // stub for later
  },
  wand: {
    key: 'wand',
    displayName: 'Wand',
    slot: 'mainhand',
    base: { min: 2, max: 3, rate: 1.0 },
    scales: { physique: 0.1, agility: 0.2, mind: 0.7 },
    tags: [], // not physical for now
  },
  focus: {
    key: 'focus',
    displayName: 'Focus',
    slot: 'mainhand',
    base: { min: 1, max: 3, rate: 1.1 },
    scales: { physique: 0.05, agility: 0.15, mind: 0.8 },
    tags: [],
    signatureAbilityKey: 'mindSpike', // stub for later
  },
  scepter: {
    key: 'scepter',
    displayName: 'Scepter',
    slot: 'mainhand',
    base: { min: 3, max: 5, rate: 0.95 },
    scales: { physique: 0.1, agility: 0.2, mind: 0.7 },
    tags: [],
    signatureAbilityKey: 'wardBreak', // stub for later
  },
};
