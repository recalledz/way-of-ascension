export const TALISMANS = {
  qiPendant: {
    key: 'qiPendant',
    name: 'Qi Pendant',
    type: 'talisman',
    bonuses: { qiRegenMult: 0.1 },
    desc: '+10% Qi regeneration',
  },
  luckyCharm: {
    key: 'luckyCharm',
    name: 'Lucky Charm',
    type: 'talisman',
    bonuses: { dropRateMult: 0.1 },
    desc: '+10% drop rate',
  },
  scholarSeal: {
    key: 'scholarSeal',
    name: "Scholar's Seal",
    type: 'talisman',
    bonuses: { qiRegenMult: 0.05, dropRateMult: 0.05 },
    desc: '+5% Qi regen, +5% drop rate',
  },
};

export function getTalisman(id) {
  return TALISMANS[id] || null;
}

export function listTalismans() {
  return Object.values(TALISMANS);
}
