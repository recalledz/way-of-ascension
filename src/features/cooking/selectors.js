import { S } from '../../shared/state.js';
import { getBuildingBonuses } from '../sect/selectors.js';

export function getCookingState(state = S) {
  return state.cooking || { level: 1, exp: 0, expMax: 100, successBonus: 0 };
}

export function getCookingSuccessBonus(state = S) {
  const base = getCookingState(state).successBonus || 0;
  const building = getBuildingBonuses(state).cookingSuccess || 0;
  return base + building;
}

export function getCookingSpeedBonus(state = S){
  return getBuildingBonuses(state).cookingSpeed || 0;
}

export function getCookingYieldBonus(state = S) {
  const lvl = getCookingState(state).level || 1;
  return (lvl - 1) * 0.1;
}
