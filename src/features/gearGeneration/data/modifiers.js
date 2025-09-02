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
};

export const MODIFIER_KEYS = Object.keys(MODIFIERS);

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
