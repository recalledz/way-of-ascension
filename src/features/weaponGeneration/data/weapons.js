import { generateWeapon } from '../logic.js';

function defaultAnimationsForType(typeKey) {
  switch (typeKey) {
    case 'sword':
      return { fx: ['slashArc'], tint: 'auto' };
    case 'spear':
      return { fx: ['pierceThrust'], tint: 'auto' };
    case 'hammer':
      return { fx: ['smash'], tint: 'auto' };
    case 'nunchaku':
      return { fx: ['flurry'], tint: 'auto' };
    case 'chakram':
      return { fx: ['spinThrow'], tint: 'auto' };
    case 'wand':
      return { fx: ['magicBolt'], tint: '#8ecaff' };
    case 'scepter':
      return { fx: ['smite'], tint: '#ffd27a' };
    case 'focus':
      // Focus has special defensive FX handled in adventure.js
      return { fx: [], tint: '#9ed2ff' };
    case 'fist':
      // Placeholder: use palm-like thrust for jabs
      return { fx: ['palmStrike'], tint: 'auto' };
    default:
      return { fx: [], tint: 'auto' };
  }
}

function toLegacy(key, item){
  return {
    key,
    displayName: item.name,
    quality: item.quality,
    affixes: [...item.affixes],
    slot: 'mainhand',
    typeKey: item.typeKey,
    base: { min: item.base.min, max: item.base.max, attackRate: item.base.rate },
    scales: { ...item.scales },
    tags: [...item.tags],
    reqs: { realmMin: 1, proficiencyMin: 0 },
    proficiencyKey: item.typeKey,
    abilityKeys: [...item.abilityKeys],
    animations: defaultAnimationsForType(item.typeKey),
  };
}

const FIST = {
  key: 'fist',
  displayName: 'Fists',
  typeKey: 'fist',
  quality: 'normal',
  affixes: [],
  slot: 'mainhand',
  base: { min: 1, max: 3, attackRate: 1.0 },
  scales: { physique: 0.4, agility: 0.3, mind: 0.3 },
  tags: ['melee'],
  reqs: { realmMin: 0, proficiencyMin: 0 },
  proficiencyKey: 'fist',
  abilityKeys: ['seventyFive'],
  animations: defaultAnimationsForType('fist'),
};

export const WEAPONS = {
  fist: FIST,
  ironSword: toLegacy('ironSword', generateWeapon({ typeKey: 'sword', materialKey: 'iron' })),
  bronzeHammer: toLegacy('bronzeHammer', generateWeapon({ typeKey: 'hammer', materialKey: 'bronze' })),
  elderWand: toLegacy('elderWand', generateWeapon({ typeKey: 'wand', materialKey: 'spiritwood' })),
};

const FIST_BASE_MAX = FIST.base.max;
export const WEAPON_FLAGS = Object.fromEntries(
  Object.keys(WEAPONS).map(key => [key, true])
);

export const WEAPON_CONFIG = Object.fromEntries(
  Object.entries(WEAPONS).map(([key, weapon]) => [
    key,
    {
      damageMultiplier: (weapon.base?.max ?? FIST_BASE_MAX) / FIST_BASE_MAX,
      proficiencyBase: 0,
    },
  ])
);
