export const AFFIXES = {
  Armored: {
    apply: h => { h.eDef *= 1.4; },
    color: '#4e79a7',
    desc: '+40% defense - reduces incoming damage'
  },
  Frenzied: {
    apply: h => { h.eAtk *= 1.35; },
    color: '#e15759',
    desc: '+35% attack power - deals more damage'
  },
  Regenerating: {
    apply: h => { h.regen += 0.02; },
    color: '#59a14f',
    desc: '+2% health regeneration per tick'
  },
  Giant: {
    apply: h => { h.enemyMax = Math.floor(h.enemyMax * 1.6); h.enemyHP = h.enemyMax; },
    color: '#b07aa1',
    desc: '+60% maximum health'
  },
  Swift: {
    apply: h => { h.eAtk *= 1.15; },
    color: '#f28e2b',
    desc: '+15% attack power - minor damage boost'
  }
};

export const AFFIX_KEYS = Object.keys(AFFIXES);

export function applyRandomAffixes(h, count = 1 + Math.floor(Math.random() * 3)) {
  h.affixes = [];
  const choices = [...AFFIX_KEYS];
  for (let i = 0; i < count; i++) {
    if (!choices.length) break;
    const idx = Math.floor(Math.random() * choices.length);
    const key = choices.splice(idx, 1)[0];
    h.affixes.push(key);
    const apply = AFFIXES[key]?.apply;
    if (apply) apply(h);
  }
  return h;
}
