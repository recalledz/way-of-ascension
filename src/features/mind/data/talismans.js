// src/features/mind/data/talismans.js

export const TALISMAN_RECIPES = {
  qiPendant: { id: 'qiPendant', name: 'Qi Pendant', tier: 1, xpMult: 1.0, cost: { fiber: 5 } },
  luckyCharm: { id: 'luckyCharm', name: 'Lucky Charm', tier: 1, xpMult: 1.0, cost: { fiber: 5, herb: 2 } },
  scholarSeal: { id: 'scholarSeal', name: "Scholar's Seal", tier: 2, xpMult: 1.4, cost: { fiber: 10, ink: 3 } },
};

export function getTalismanRecipe(id) {
  return TALISMAN_RECIPES[id] || null;
}

export function listTalismanRecipes() {
  return Object.values(TALISMAN_RECIPES);
}

