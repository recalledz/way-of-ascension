import { alchemyState } from './state.js';
import { ALCHEMY_RECIPES } from './data/recipes.js';
import { getMaxSlots, getSuccessChance } from './selectors.js';
import { qCap, clamp } from '../progression/selectors.js';

function slice(state){
  return state.alchemy || alchemyState;
}

export function startBrew(state, recipe){
  const alch = slice(state);
  if(!alch.unlocked) return false;
  if(alch.queue.length >= getMaxSlots(state)) return false;
  if(!alch.knownRecipes.includes(recipe.key)) return false;
  alch.queue.push({ key: recipe.key, name: recipe.name, t: recipe.time, T: recipe.time, done:false });
  return true;
}

export function completeBrew(state, index){
  const alch = slice(state);
  const q = alch.queue[index];
  if(!q || !q.done) return false;
  const recipe = ALCHEMY_RECIPES[q.key];
  const chance = getSuccessChance(recipe, state);
  if(Math.random() < chance){
    recipe.effect?.(state);
  }
  alch.xp += recipe.xp || 0;
  alch.queue.splice(index,1);
  const threshold = 30 + 20 * (alch.level - 1);
  if(alch.xp >= threshold){
    alch.level++;
    alch.xp = 0;
  }
  return true;
}

export function unlockRecipe(state, key){
  const alch = slice(state);
  if(!alch.knownRecipes.includes(key)) alch.knownRecipes.push(key);
}

export function usePill(root, type) {
  root.pills ??= { qi: 0, body: 0, ward: 0 };
  if ((root.pills[type] ?? 0) <= 0) return { ok: false, reason: 'none' };

  if (type === 'qi') {
    const add = Math.floor(qCap(root) * 0.25);
    root.qi = clamp(root.qi + add, 0, qCap(root));
  }
  if (type === 'body') {
    root.tempAtk = (root.tempAtk || 0) + 4;
    root.tempArmor = (root.tempArmor || 0) + 3;
    // NOTE: timer remains in UI for now; long-term move to a timed effect system
  }
  if (type === 'ward') {
    // consumed during breakthrough
  }

  root.pills[type]--;
  return { ok: true, type };
}
