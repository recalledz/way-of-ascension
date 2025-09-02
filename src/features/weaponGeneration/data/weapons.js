import { generateWeapon } from '../logic.js';

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

function toLegacy(key, item){
  return {
    key,
    displayName: item.name,
    quality: item.quality,
    modifiers: [...(item.modifiers || [])],
    rarity: item.rarity,
    slot: 'mainhand',
    typeKey: item.typeKey,
    classKey: item.classKey,
    base: {
      phys: { min: item.base.phys.min, max: item.base.phys.max },
      rate: item.base.rate,
      elems: { ...item.base.elems }
    },
    tags: [...item.tags],
    reqs: { realmMin: 1, proficiencyMin: 0 },
    abilityKeys: [...item.abilityKeys],
    stats: item.stats ? { ...item.stats } : undefined,
    animations: defaultAnimationsForType(item.typeKey),
  };
}

const FIST = {
  key: 'fist',
  displayName: 'Fists',
  typeKey: 'fist',
  classKey: 'fist',
  quality: 'basic',
  modifiers: [],
  rarity: 'normal',
  slot: 'mainhand',
  base: { phys: { min: 1, max: 3 }, rate: 1.0, elems: {} },
  tags: ['melee'],
  reqs: { realmMin: 0, proficiencyMin: 0 },
  abilityKeys: ['seventyFive'],
  animations: defaultAnimationsForType('fist'),
};

const PALM_WRAPS = {
  ...FIST,
  key: 'palmWraps',
  displayName: 'Palm Wraps',
  typeKey: 'palm',
  classKey: 'palm',
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
  ironStraightSword: toLegacy('ironStraightSword', generateWeapon({ typeKey: 'straightSword', materialKey: 'iron', qualityKey: 'basic' })),
  crudeDagger: toLegacy('crudeDagger', generateWeapon({ typeKey: 'crudeDagger', materialKey: 'iron', qualityKey: 'basic' })),
  crudeRapier: toLegacy('crudeRapier', generateWeapon({ typeKey: 'crudeRapier', materialKey: 'iron', qualityKey: 'basic' })),
  crudeHammer: toLegacy('crudeHammer', generateWeapon({ typeKey: 'crudeHammer', materialKey: 'bronze', qualityKey: 'basic' })),
  crudeBludgeon: toLegacy('crudeBludgeon', generateWeapon({ typeKey: 'crudeBludgeon', materialKey: 'bronze', qualityKey: 'basic' })),
  crudeAxe: toLegacy('crudeAxe', generateWeapon({ typeKey: 'crudeAxe', materialKey: 'iron', qualityKey: 'basic' })),
  bronzeSpear: toLegacy('bronzeSpear', generateWeapon({ typeKey: 'spear', materialKey: 'bronze', qualityKey: 'basic' })),
  dimFocus: toLegacy('dimFocus', generateWeapon({ typeKey: 'dimFocus', materialKey: 'spiritwood', qualityKey: 'basic' })),
  starFocus: toLegacy('starFocus', generateWeapon({ typeKey: 'starFocus', materialKey: 'spiritwood', qualityKey: 'basic' })),
  crudeKnuckles: toLegacy('crudeKnuckles', generateWeapon({ typeKey: 'crudeKnuckles', materialKey: 'iron', qualityKey: 'basic' })),
  crudeNunchaku: toLegacy('crudeNunchaku', generateWeapon({ typeKey: 'crudeNunchaku', materialKey: 'spiritwood', qualityKey: 'basic' })),
  tameNunchaku: toLegacy('tameNunchaku', generateWeapon({ typeKey: 'tameNunchaku', materialKey: 'spiritwood', qualityKey: 'basic' })),
};

const FIST_BASE_MAX = FIST.base.phys.max;
export const WEAPON_FLAGS = Object.fromEntries(
  Object.keys(WEAPONS).map(key => [key, true])
);

export const WEAPON_CONFIG = Object.fromEntries(
  Object.entries(WEAPONS).map(([key, weapon]) => [
    key,
    {
      damageMultiplier: (weapon.base?.phys.max ?? FIST_BASE_MAX) / FIST_BASE_MAX,
      proficiencyBase: 0,
    },
  ])
);
