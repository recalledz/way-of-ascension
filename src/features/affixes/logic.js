import { AFFIXES, AFFIX_KEYS } from './data/affixes.js';

export function applyRandomAffixes(h, count = Math.floor(Math.random() * 3)) {
  h.affixes = [];
  const choices = [...AFFIX_KEYS];
  for (let i = 0; i < count; i++) {
    if (!choices.length) break;
    const idx = Math.floor(Math.random() * choices.length);
    const key = choices.splice(idx, 1)[0];
    h.affixes.push(key);
    const affix = AFFIXES[key];
    if (affix?.apply) affix.apply(h);
  }
  return h;
}

// Future affix-related helpers can be added here

