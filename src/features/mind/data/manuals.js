// src/features/mind/data/manuals.js

export const MANUALS = {
  logic101: { id: 'logic101', name: 'Logic 101', xpRate: 0.5, reqLevel: 1, category: 'Logic' },
  mnemonics: { id: 'mnemonics', name: 'Mnemonics Primer', xpRate: 0.4, reqLevel: 2, category: 'Memory' },
  paradox: { id: 'paradox', name: 'Paradox Studies', xpRate: 0.3, reqLevel: 4, category: 'Abstraction' },
};

export function getManual(id) {
  return MANUALS[id] || null;
}

export function listManuals() {
  return Object.values(MANUALS);
}

