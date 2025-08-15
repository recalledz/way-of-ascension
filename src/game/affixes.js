export const AFFIX_DEFS = {
  Armored: h => { h.eDef *= 1.4; },
  Frenzied: h => { h.eAtk *= 1.35; },
  Regenerating: h => { h.regen += 0.02; },
  Giant: h => { h.enemyMax = Math.floor(h.enemyMax * 1.6); h.enemyHP = h.enemyMax; },
  Swift: h => { h.eAtk *= 1.15; }
};

export const AFFIX_KEYS = Object.keys(AFFIX_DEFS);

export function applyRandomAffixes(h, count = Math.floor(Math.random() * 3)) {
  h.affixes = [];
  const choices = [...AFFIX_KEYS];
  for (let i = 0; i < count; i++) {
    if (!choices.length) break;
    const idx = Math.floor(Math.random() * choices.length);
    const key = choices.splice(idx, 1)[0];
    h.affixes.push(key);
    const apply = AFFIX_DEFS[key];
    if (apply) apply(h);
  }
  return h;
}
