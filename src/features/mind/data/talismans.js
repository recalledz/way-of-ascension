// src/features/mind/data/talismans.js

export const TALISMANS = {
  wardPaper: { id: 'wardPaper', name: 'Paper Ward', tier: 1, type: 'defense', xpMult: 1.0, cost: { fiber: 5 } },
  inkSeal:   { id: 'inkSeal',   name: 'Ink Seal',   tier: 2, type: 'focus',   xpMult: 1.4, cost: { fiber: 10, ink: 3 } },
  jadeGlyph: { id: 'jadeGlyph', name: 'Jade Glyph', tier: 3, type: 'clarity', xpMult: 1.9, cost: { jade: 1, ink: 5 } },
};

export function getTalisman(id) {
  return TALISMANS[id] || null;
}

export function listTalismans() {
  return Object.values(TALISMANS);
}

