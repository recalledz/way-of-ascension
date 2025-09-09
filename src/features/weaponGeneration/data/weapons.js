import { generateWeapon } from '../logic.js';
import { WEAPON_TYPES } from './weaponTypes.js';

export function defaultAnimationsForType(typeKey) {
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

function withAnimations(item) {
  return { ...item, animations: defaultAnimationsForType(item.typeKey) };
}

export const FIST = withAnimations({
  name: 'Fists',
  type: 'weapon',
  slot: 'mainhand',
  typeKey: 'fist',
  classKey: 'fist',
  quality: 'basic',
  rarity: 'normal',
  modifiers: [],
  base: { phys: { min: 1, max: 3 }, rate: 1.0, elems: {} },
  tags: ['melee'],
  reqs: { realmMin: 0, proficiencyMin: 0 },
  abilityKeys: ['seventyFive'],
});

export const PALM_WRAPS = withAnimations({
  ...FIST,
  name: 'Palm Wraps',
  typeKey: 'palm',
  classKey: 'palm',
  abilityKeys: ['palmStrike'],
  stats: {
    stunBuildMult: 0.3,
    stunDurationMult: 0.1,
  },
});

export const WEAPONS = {
  fist: FIST,
  palmWraps: PALM_WRAPS,
  ironStraightSword: withAnimations(generateWeapon({ typeKey: 'straightSword', materialKey: 'iron', qualityKey: 'basic' })),
  crudeDagger: withAnimations(generateWeapon({ typeKey: 'crudeDagger', materialKey: 'iron', qualityKey: 'basic' })),
  crudeRapier: withAnimations(generateWeapon({ typeKey: 'crudeRapier', materialKey: 'iron', qualityKey: 'basic' })),
  crudeHammer: withAnimations(generateWeapon({ typeKey: 'crudeHammer', materialKey: 'bronze', qualityKey: 'basic' })),
  crudeBludgeon: withAnimations(generateWeapon({ typeKey: 'crudeBludgeon', materialKey: 'bronze', qualityKey: 'basic' })),
  crudeAxe: withAnimations(generateWeapon({ typeKey: 'crudeAxe', materialKey: 'iron', qualityKey: 'basic' })),
  bronzeSpear: withAnimations(generateWeapon({ typeKey: 'spear', materialKey: 'bronze', qualityKey: 'basic' })),
  dimFocus: withAnimations(generateWeapon({ typeKey: 'dimFocus', materialKey: 'spiritwood', qualityKey: 'basic' })),
  starFocus: withAnimations(generateWeapon({ typeKey: 'starFocus', materialKey: 'spiritwood', qualityKey: 'basic' })),
  crudeKnuckles: withAnimations(generateWeapon({ typeKey: 'crudeKnuckles', materialKey: 'iron', qualityKey: 'basic' })),
  crudeNunchaku: withAnimations(generateWeapon({ typeKey: 'crudeNunchaku', materialKey: 'spiritwood', qualityKey: 'basic' })),
  tameNunchaku: withAnimations(generateWeapon({ typeKey: 'tameNunchaku', materialKey: 'spiritwood', qualityKey: 'basic' })),
};

const FIST_BASE_MAX = FIST.base.phys.max;
export const WEAPON_FLAGS = {
  fist: true,
  palmWraps: true,
  ...Object.fromEntries(Object.keys(WEAPON_TYPES).map(key => [key, true])),
};

export const WEAPON_CONFIG = {
  fist: { damageMultiplier: 1, proficiencyBase: 0 },
  palmWraps: { damageMultiplier: (PALM_WRAPS.base.phys.max || FIST_BASE_MAX) / FIST_BASE_MAX, proficiencyBase: 0 },
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

