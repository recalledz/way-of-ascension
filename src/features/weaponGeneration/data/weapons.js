import { generateWeapon } from '../logic.js';
import { WEAPON_TYPES } from './weaponTypes.js';

function defaultAnimationsForType(typeKey) {
  switch (typeKey) {
    case 'straightSword':
    case 'crudeAxe':
      return { fx: ['slashArc'], tint: 'auto' };
    case 'crudeDagger':
    case 'crudeRapier':
    case 'spear':
      return { fx: ['pierceThrust'], tint: 'auto' };
    case 'crudeHammer':
    case 'crudeBludgeon':
      return { fx: ['smash'], tint: 'auto' };
    case 'crudeNunchaku':
    case 'tameNunchaku':
      return { fx: ['flurry'], tint: 'auto' };
    case 'dimFocus':
    case 'starFocus':
      return { fx: ['magicBolt'], tint: '#8ecaff' };
    case 'crudeKnuckles':
      return { fx: ['palmStrike'], tint: 'auto' };
    case 'palm':
      return { fx: ['palmStrike'], tint: 'auto' };
    case 'fist':
      // Placeholder: use palm-like thrust for jabs
      return { fx: ['palmStrike'], tint: 'auto' };
    default:
      return { fx: [], tint: 'auto' };
  }
}

const FIST = {
  key: 'fist',
  name: 'Fists',
  type: 'weapon',
  slot: 'mainhand',
  typeKey: 'fist',
  classKey: 'fist',
  quality: 'basic',
  rarity: 'normal',
  modifiers: [],
  base: { phys: { min: 1, max: 3 }, rate: 1.0, elems: {} },
  tags: ['physical'],
  abilityKeys: ['seventyFive'],
  animations: defaultAnimationsForType('fist'),
};

const PALM_WRAPS = {
  key: 'palmWraps',
  name: 'Palm Wraps',
  type: 'weapon',
  slot: 'mainhand',
  typeKey: 'palm',
  classKey: 'palm',
  quality: 'basic',
  rarity: 'normal',
  modifiers: [],
  base: { phys: { min: 1, max: 3 }, rate: 1.0, elems: {} },
  tags: ['physical'],
  abilityKeys: ['palmStrike'],
  stats: {
    stunBuildMult: 0.3,
    stunDurationMult: 0.1,
  },
  animations: defaultAnimationsForType('palm'),
};

export const WEAPONS = {
  fist: FIST,
  palmWraps: PALM_WRAPS,
  straightSword: {
    key: 'straightSword',
    ...generateWeapon({ typeKey: 'straightSword', materialKey: 'iron', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('straightSword'),
  },
  crudeDagger: {
    key: 'crudeDagger',
    ...generateWeapon({ typeKey: 'crudeDagger', materialKey: 'iron', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('crudeDagger'),
  },
  crudeRapier: {
    key: 'crudeRapier',
    ...generateWeapon({ typeKey: 'crudeRapier', materialKey: 'iron', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('crudeRapier'),
  },
  crudeHammer: {
    key: 'crudeHammer',
    ...generateWeapon({ typeKey: 'crudeHammer', materialKey: 'bronze', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('crudeHammer'),
  },
  crudeBludgeon: {
    key: 'crudeBludgeon',
    ...generateWeapon({ typeKey: 'crudeBludgeon', materialKey: 'bronze', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('crudeBludgeon'),
  },
  crudeAxe: {
    key: 'crudeAxe',
    ...generateWeapon({ typeKey: 'crudeAxe', materialKey: 'iron', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('crudeAxe'),
  },
  spear: {
    key: 'spear',
    ...generateWeapon({ typeKey: 'spear', materialKey: 'bronze', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('spear'),
  },
  dimFocus: {
    key: 'dimFocus',
    ...generateWeapon({ typeKey: 'dimFocus', materialKey: 'spiritwood', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('dimFocus'),
  },
  starFocus: {
    key: 'starFocus',
    ...generateWeapon({ typeKey: 'starFocus', materialKey: 'spiritwood', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('starFocus'),
  },
  crudeKnuckles: {
    key: 'crudeKnuckles',
    ...generateWeapon({ typeKey: 'crudeKnuckles', materialKey: 'iron', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('crudeKnuckles'),
  },
  crudeNunchaku: {
    key: 'crudeNunchaku',
    ...generateWeapon({ typeKey: 'crudeNunchaku', materialKey: 'spiritwood', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('crudeNunchaku'),
  },
  tameNunchaku: {
    key: 'tameNunchaku',
    ...generateWeapon({ typeKey: 'tameNunchaku', materialKey: 'spiritwood', qualityKey: 'basic' }),
    animations: defaultAnimationsForType('tameNunchaku'),
  },
};

const FIST_BASE_MAX = FIST.base.phys.max;
export const WEAPON_FLAGS = {
  fist: true,
  palmWraps: true,
  ...Object.fromEntries(Object.keys(WEAPON_TYPES).map(key => [key, true])),
};

export const WEAPON_CONFIG = {
  fist: { damageMultiplier: FIST.base.phys.max / FIST_BASE_MAX, proficiencyBase: 0 },
  palmWraps: { damageMultiplier: PALM_WRAPS.base.phys.max / FIST_BASE_MAX, proficiencyBase: 0 },
  ...Object.fromEntries(
    Object.entries(WEAPON_TYPES).map(([key, type]) => [
      key,
      {
        damageMultiplier: (type.base?.max ?? FIST_BASE_MAX) / FIST_BASE_MAX,
        proficiencyBase: 0,
      },
    ])
  ),
};
