import { S } from '../../game/state.js';

export function getAlchemyQueue(state = S) {
  return state.alchemy?.queue || [];
}

export function getAlchemySuccessBonus(state = S) {
  return state.alchemy?.successBonus || 0;
}

export function getBrewSuccessChance(recipe, state = S) {
  if (!recipe) return 0;
  const mind = state.stats?.mind ?? 10;
  const mindBonus = (mind - 10) * 0.04;
  return Math.min(1, recipe.base + getAlchemySuccessBonus(state) + mindBonus);
}
