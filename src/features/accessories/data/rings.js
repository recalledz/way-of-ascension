export const RINGS = {
  ironSignet: {
    key: 'ironSignet',
    name: 'Iron Signet',
    type: 'ring',
    protection: { armor: 15 },
    desc: '+15 Armor',
  },
  jadeBand: {
    key: 'jadeBand',
    name: 'Jade Band',
    type: 'ring',
    protection: { dodge: 10 },
    desc: '+10 Dodge',
  },
  scholarRing: {
    key: 'scholarRing',
    name: "Scholar's Ring",
    type: 'ring',
    offense: { accuracy: 20 },
    desc: '+20 Accuracy',
  },
  spiritBand: {
    key: 'spiritBand',
    name: 'Spirit Band',
    type: 'ring',
    bonuses: { qiRegenMult: 0.05 },
    desc: '+5% Qi regeneration',
  },
};

export function getRing(key) {
  return RINGS[key] || null;
}

export function listRings() {
  return Object.values(RINGS);
}
