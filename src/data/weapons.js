export const WEAPONS = {
  fist: {
    key: 'fist',
    displayName: 'Fists',
    slot: 'mainhand',
    base: { min: 1, max: 3, attackRate: 1.0 }, // DPS shape
    scales: { physique: 0.4, agility: 0.3, mind: 0.3 }, // weights sum ~1
    tags: ['melee'],
    statusHooks: { onHit: null, onCrit: null }, // no status
    reqs: { realmMin: 0, proficiencyMin: 0 },
    proficiencyKey: 'fist',
    animations: { fx: ['slashArc'], tint: 'auto' },
  },
  palm: {
    key: 'palm',
    displayName: 'Palm',
    slot: 'mainhand',
    base: { min: 2, max: 4, attackRate: 1.2 },
    scales: { physique: 0.3, agility: 0.5, mind: 0.2 },
    tags: ['melee'],
    statusHooks: { onHit: null, onCrit: null },
    reqs: { realmMin: 0, proficiencyMin: 10 },
    proficiencyKey: 'palm',
    animations: { fx: ['palmStrike'], tint: 'auto' },
  },
  sword: {
    key: 'sword',
    displayName: 'Sword',
    slot: 'mainhand',
    base: { min: 4, max: 8, attackRate: 1.0 },
    scales: { physique: 0.5, agility: 0.3, mind: 0.2 },
    tags: ['melee'],
    statusHooks: { onHit: null, onCrit: null },
    reqs: { realmMin: 1, proficiencyMin: 20 },
    proficiencyKey: 'sword',
    animations: { fx: ['slashArc'], tint: 'auto' },
  },
  spear: {
    key: 'spear',
    displayName: 'Spear',
    slot: 'mainhand',
    base: { min: 3, max: 7, attackRate: 0.9 },
    scales: { physique: 0.4, agility: 0.4, mind: 0.2 },
    tags: ['melee'],
    statusHooks: { onHit: null, onCrit: null },
    reqs: { realmMin: 1, proficiencyMin: 20 },
    proficiencyKey: 'spear',
    animations: { fx: ['pierceThrust'], tint: 'auto' },
  },
  nunchaku: {
    key: 'nunchaku',
    displayName: 'Nunchaku',
    slot: 'mainhand',
    base: { min: 2, max: 5, attackRate: 1.4 },
    scales: { physique: 0.3, agility: 0.5, mind: 0.2 },
    tags: ['melee'],
    statusHooks: { onHit: null, onCrit: null }, // TODO: add stun or bleed effect
    reqs: { realmMin: 2, proficiencyMin: 30 },
    proficiencyKey: 'nunchaku',
    animations: { fx: ['flurry'], tint: 'auto' },
  },
  chakram: {
    key: 'chakram',
    displayName: 'Chakram',
    slot: 'mainhand',
    base: { min: 3, max: 6, attackRate: 1.2 },
    scales: { physique: 0.2, agility: 0.5, mind: 0.3 },
    tags: ['ranged'],
    statusHooks: { onHit: null, onCrit: null },
    reqs: { realmMin: 2, proficiencyMin: 30 },
    proficiencyKey: 'chakram',
    animations: { fx: ['spinThrow'], tint: 'auto' },
  },
  wand: {
    key: 'wand',
    displayName: 'Wand',
    slot: 'mainhand',
    base: { min: 2, max: 4, attackRate: 1.1 },
    scales: { physique: 0.1, agility: 0.2, mind: 0.7 },
    tags: ['magic'],
    statusHooks: { onHit: 'burn', onCrit: null },
    reqs: { realmMin: 1, proficiencyMin: 20 },
    proficiencyKey: 'wand',
    animations: { fx: ['magicBolt'], tint: 'auto' },
  },
  focus: {
    key: 'focus',
    displayName: 'Focus',
    slot: 'mainhand',
    base: { min: 1, max: 3, attackRate: 1.0 },
    scales: { physique: 0.1, agility: 0.2, mind: 0.7 },
    tags: ['magic'],
    statusHooks: { onHit: 'chill', onCrit: null },
    reqs: { realmMin: 1, proficiencyMin: 20 },
    proficiencyKey: 'focus',
    animations: { fx: ['magicBolt'], tint: 'blue' },
  },
  hammer: {
    key: 'hammer',
    displayName: 'Hammer',
    slot: 'mainhand',
    base: { min: 6, max: 10, attackRate: 0.8 },
    scales: { physique: 0.6, agility: 0.2, mind: 0.2 },
    tags: ['melee'],
    statusHooks: { onHit: null, onCrit: null }, // TODO: add stun effect
    reqs: { realmMin: 2, proficiencyMin: 30 },
    proficiencyKey: 'hammer',
    animations: { fx: ['smash'], tint: 'auto' },
  },
  scepter: {
    key: 'scepter',
    displayName: 'Scepter',
    slot: 'mainhand',
    base: { min: 3, max: 5, attackRate: 1.0 },
    scales: { physique: 0.2, agility: 0.1, mind: 0.7 },
    tags: ['magic', 'melee'],
    statusHooks: { onHit: 'burn', onCrit: null },
    reqs: { realmMin: 3, proficiencyMin: 40 },
    proficiencyKey: 'scepter',
    animations: { fx: ['smite'], tint: 'auto' },
  },
};

// TODO: balance weapon stats and effects

// Derived compatibility exports
const FIST_BASE_MAX = WEAPONS.fist.base.max;

export const WEAPON_FLAGS = Object.fromEntries(
  Object.keys(WEAPONS).map(key => [key, true])
);

export const WEAPON_CONFIG = Object.fromEntries(
  Object.entries(WEAPONS).map(([key, weapon]) => [
    key,
    {
      damageMultiplier: (weapon.base?.max ?? FIST_BASE_MAX) / FIST_BASE_MAX,
      proficiencyBase: weapon.reqs?.proficiencyMin ?? 0,
    },
  ])
);

// TODO: refine derived config values
