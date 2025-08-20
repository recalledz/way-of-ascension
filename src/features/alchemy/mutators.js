import { S } from '../../game/state.js';
import { RECIPES } from './data/recipes.js';
import { calculateBrewSuccess } from './logic.js';

export function startBrew(state = S, recipe) {
  if (!state.alchemy?.unlocked) return false;
  if (!recipe) return false;
  if (state.alchemy.queue.length >= state.alchemy.maxSlots) return false;
  if (!state.alchemy.knownRecipes.includes(recipe.key)) return false;
  state.alchemy.queue.push({
    key: recipe.key,
    name: recipe.name,
    t: recipe.time,
    total: recipe.time,
    done: false,
    recipe,
  });
  return true;
}

export function completeBrew(state = S, index = 0) {
  const q = state.alchemy.queue[index];
  if (!q || !q.done) return false;
  const { recipe } = q;
  const chance = calculateBrewSuccess(recipe, state);
  if (Math.random() < chance) {
    recipe?.give?.(state);
  } else {
    const cost = recipe.cost || {};
    if (cost.herbs) state.herbs = (state.herbs || 0) + Math.floor(cost.herbs * 0.3);
    if (cost.ore) state.ore = (state.ore || 0) + Math.floor(cost.ore * 0.3);
    if (cost.wood) state.wood = (state.wood || 0) + Math.floor(cost.wood * 0.3);
  }
  state.alchemy.queue.splice(index, 1);
  const levelNeeded = 30 + 20 * (state.alchemy.level - 1);
  if (state.alchemy.xp >= levelNeeded) {
    state.alchemy.level++;
    state.alchemy.xp = 0;
  }
  return true;
}

export function unlockRecipe(state = S, recipeKey) {
  if (!state.alchemy.knownRecipes.includes(recipeKey)) {
    state.alchemy.knownRecipes.push(recipeKey);
  }
}

export { RECIPES };
