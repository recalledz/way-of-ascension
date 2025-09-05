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
