export const MODIFIERS = {
  increasedArmor: {
    lane: 'armor',
    value: 0.1,
    desc: '+10% Armor',
    appliesTo: ['armor', 'ring'],
  },
  increasedDodge: {
    lane: 'dodge',
    value: 0.1,
    desc: '+10% Dodge',
    appliesTo: ['armor', 'ring'],
  },
  increasedAccuracy: {
    lane: 'accuracy',
    value: 0.1,
    desc: '+10% Accuracy',
    appliesTo: ['armor', 'ring'],
  },
  increasedDamage: {
    lane: 'damage',
    value: 0.1,
    desc: '+10% Weapon Damage',
    appliesTo: ['weapon', 'ring'], // boosts base weapon damage only; spells use separate modifiers
  },
  physFlat: {
    lane: 'physFlat',
    element: 'physical',
    range: { min: 1, max: 3 },
    desc: '+1-3 Physical Damage',
    appliesTo: ['weapon', 'ring'],
  },
  fireFlat: {
    lane: 'fireFlat',
    element: 'fire',
    range: { min: 1, max: 3 },
    desc: '+1-3 Fire Damage',
    appliesTo: ['weapon', 'ring'],
  },
  waterFlat: {
    lane: 'waterFlat',
    element: 'water',
    range: { min: 1, max: 3 },
    desc: '+1-3 Water Damage',
    appliesTo: ['weapon', 'ring'],
  },
  woodFlat: {
    lane: 'woodFlat',
    element: 'wood',
    range: { min: 1, max: 3 },
    desc: '+1-3 Wood Damage',
    appliesTo: ['weapon', 'ring'],
  },
  earthFlat: {
    lane: 'earthFlat',
    element: 'earth',
    range: { min: 1, max: 3 },
    desc: '+1-3 Earth Damage',
    appliesTo: ['weapon', 'ring'],
  },
  metalFlat: {
    lane: 'metalFlat',
    element: 'metal',
    range: { min: 1, max: 3 },
    desc: '+1-3 Metal Damage',
    appliesTo: ['weapon', 'ring'],
  },
  physPct: {
    lane: 'physPct',
    element: 'physical',
    value: 0.1,
    desc: '+10% Physical Damage',
    appliesTo: ['weapon', 'ring'],
  },
  firePct: {
    lane: 'firePct',
    element: 'fire',
    value: 0.1,
    desc: '+10% Fire Damage',
    appliesTo: ['weapon', 'ring'],
  },
  waterPct: {
    lane: 'waterPct',
    element: 'water',
    value: 0.1,
    desc: '+10% Water Damage',
    appliesTo: ['weapon', 'ring'],
  },
  woodPct: {
    lane: 'woodPct',
    element: 'wood',
    value: 0.1,
    desc: '+10% Wood Damage',
    appliesTo: ['weapon', 'ring'],
  },
  earthPct: {
    lane: 'earthPct',
    element: 'earth',
    value: 0.1,
    desc: '+10% Earth Damage',
    appliesTo: ['weapon', 'ring'],
  },
  metalPct: {
    lane: 'metalPct',
    element: 'metal',
    value: 0.1,
    desc: '+10% Metal Damage',
    appliesTo: ['weapon', 'ring'],
  },
};

export const MODIFIER_KEYS = Object.keys(MODIFIERS);

export const ELEMENTAL_MODIFIERS = {
  physical: ['physFlat', 'physPct'],
  fire: ['fireFlat', 'firePct'],
  water: ['waterFlat', 'waterPct'],
  wood: ['woodFlat', 'woodPct'],
  earth: ['earthFlat', 'earthPct'],
  metal: ['metalFlat', 'metalPct'],
};

export const WEAPON_MODIFIERS = MODIFIER_KEYS.filter(
  k => MODIFIERS[k].appliesTo.includes('weapon')
);
export const ARMOR_MODIFIERS = MODIFIER_KEYS.filter(
  k => MODIFIERS[k].appliesTo.includes('armor')
);
export const RING_MODIFIERS = MODIFIER_KEYS.filter(
  k => MODIFIERS[k].appliesTo.includes('ring')
);

export const MODIFIER_POOLS = {
  weapon: WEAPON_MODIFIERS,
  armor: ARMOR_MODIFIERS,
  ring: RING_MODIFIERS,
};
