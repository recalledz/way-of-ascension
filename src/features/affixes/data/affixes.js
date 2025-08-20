export const AFFIXES = {
  Armored: {
    color: '#3b82f6',
    desc: '+40% defense - reduces incoming damage',
    apply: h => { h.eDef *= 1.4; }
  },
  Frenzied: {
    color: '#ef4444',
    desc: '+35% attack power - deals more damage',
    apply: h => { h.eAtk *= 1.35; }
  },
  Regenerating: {
    color: '#22c55e',
    desc: '+2% health regeneration per tick',
    apply: h => { h.regen += 0.02; }
  },
  Giant: {
    color: '#fbbf24',
    desc: '+60% maximum health',
    apply: h => { h.enemyMax = Math.floor(h.enemyMax * 1.6); h.enemyHP = h.enemyMax; }
  },
  Swift: {
    color: '#a855f7',
    desc: '+15% attack power - minor damage boost',
    apply: h => { h.eAtk *= 1.15; }
  }
};

export const AFFIX_KEYS = Object.keys(AFFIXES);
