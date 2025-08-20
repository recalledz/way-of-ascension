import { S } from '../../game/state.js';

export function getCookingState(state = S) {
  return state.cooking || { level: 1, exp: 0, expMax: 100, successBonus: 0 };
}

export function getCookingSuccessBonus(state = S) {
  return getCookingState(state).successBonus || 0;
}

export function getCookingYieldBonus(state = S) {
  const lvl = getCookingState(state).level || 1;
  return (lvl - 1) * 0.1;
}
