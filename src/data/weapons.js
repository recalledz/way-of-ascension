import { generateWeapon } from '../systems/weaponGenerator.js';

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
    animations: { fx: [], tint: 'auto' },
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
  abilityKeys: [],
  animations: { fx: [], tint: 'auto' },
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
