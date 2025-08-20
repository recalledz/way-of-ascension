import { sectState } from './state.js';

function slice(state){
  return state.sect || state;
}

export function getBuildingLevel(key, state = sectState){
  return slice(state).buildings[key] || 0;
}

export function getBuildingBonuses(state = sectState){
  return slice(state).bonuses || {};
}

export function getDisciples(state = sectState){
  const bonuses = getBuildingBonuses(state);
  const base = state.disciples || 0;
  return base + (bonuses.disciples || 0);
}

export function getLawPointBonus(state = sectState){
  return getBuildingBonuses(state).lawPoints || 0;
}
