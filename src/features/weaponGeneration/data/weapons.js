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
    affixes: [...item.affixes],
    slot: 'mainhand',
    typeKey: item.typeKey,
    base: { min: item.base.min, max: item.base.max, attackRate: item.base.rate },
    scales: { ...item.scales },
    tags: [...item.tags],
    reqs: { realmMin: 1, proficiencyMin: 0 },
    proficiencyKey: item.typeKey,
    abilityKeys: [...item.abilityKeys],
    stats: item.stats ? { ...item.stats } : undefined,
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

const PALM_WRAPS = {
  ...FIST,
  key: 'palmWraps',
  displayName: 'Palm Wraps',
  typeKey: 'palm',
  proficiencyKey: 'palm',
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
  ironStraightSword: toLegacy('ironStraightSword', generateWeapon({ typeKey: 'straightSword', materialKey: 'iron', qualityKey: 'normal' })),
  crudeDagger: toLegacy('crudeDagger', generateWeapon({ typeKey: 'crudeDagger', materialKey: 'iron', qualityKey: 'normal' })),
  crudeRapier: toLegacy('crudeRapier', generateWeapon({ typeKey: 'crudeRapier', materialKey: 'iron', qualityKey: 'normal' })),
  crudeHammer: toLegacy('crudeHammer', generateWeapon({ typeKey: 'crudeHammer', materialKey: 'bronze', qualityKey: 'normal' })),
  crudeBludgeon: toLegacy('crudeBludgeon', generateWeapon({ typeKey: 'crudeBludgeon', materialKey: 'bronze', qualityKey: 'normal' })),
  crudeAxe: toLegacy('crudeAxe', generateWeapon({ typeKey: 'crudeAxe', materialKey: 'iron', qualityKey: 'normal' })),
  bronzeSpear: toLegacy('bronzeSpear', generateWeapon({ typeKey: 'spear', materialKey: 'bronze', qualityKey: 'normal' })),
  dimFocus: toLegacy('dimFocus', generateWeapon({ typeKey: 'dimFocus', materialKey: 'spiritwood', qualityKey: 'normal' })),
  starFocus: toLegacy('starFocus', generateWeapon({ typeKey: 'starFocus', materialKey: 'spiritwood', qualityKey: 'normal' })),
  crudeKnuckles: toLegacy('crudeKnuckles', generateWeapon({ typeKey: 'crudeKnuckles', materialKey: 'iron', qualityKey: 'normal' })),
  crudeNunchaku: toLegacy('crudeNunchaku', generateWeapon({ typeKey: 'crudeNunchaku', materialKey: 'spiritwood', qualityKey: 'normal' })),
  tameNunchaku: toLegacy('tameNunchaku', generateWeapon({ typeKey: 'tameNunchaku', materialKey: 'spiritwood', qualityKey: 'normal' })),
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
