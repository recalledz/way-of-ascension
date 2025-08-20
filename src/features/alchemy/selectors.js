import { alchemyState } from './state.js';
import { getBuildingBonuses } from '../sect/selectors.js';

function slice(state){
  return state.alchemy || alchemyState;
}

export function getQueue(state = alchemyState){
  return slice(state).queue || [];
}

export function getMaxSlots(state = alchemyState){
  const base = slice(state).maxSlots || 0;
  return base + (getBuildingBonuses(state).alchemySlots || 0);
}

export function getSuccessBonus(state = alchemyState){
  const alch = slice(state);
  const building = getBuildingBonuses(state).alchemySuccess || 0;
  const mind = (state.stats?.mind || 10) - 10;
  const mindBonus = mind * 0.04;
  return alch.successBonus + building + mindBonus;
}

export function getSuccessChance(recipe, state = alchemyState){
  const bonus = getSuccessBonus(state);
  return Math.min(recipe.base + bonus, 0.95);
}
