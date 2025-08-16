export const AFFIX_DEFS = {
  Armored: h => { h.eDef *= 1.4; },          // +40% defense - reduces incoming damage
  Frenzied: h => { h.eAtk *= 1.35; },        // +35% attack power - deals more damage
  Regenerating: h => { h.regen += 0.02; },   // +2% health regeneration per tick
  Giant: h => { h.enemyMax = Math.floor(h.enemyMax * 1.6); h.enemyHP = h.enemyMax; }, // +60% maximum health
  Swift: h => { h.eAtk *= 1.15; }            // +15% attack power - minor damage boost
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
