import { sectState } from './state.js';
import { calculateBonuses, getBuildingCost } from './logic.js';
import { SECT_BUILDINGS } from './data/buildings.js';

export function recalculateBuildingBonuses(state = sectState){
  const slice = state.sect || state;
  slice.bonuses = calculateBonuses(slice.buildings);
  return slice.bonuses;
}

export function upgradeBuilding(state, key){
  const slice = state.sect || sectState;
  const b = SECT_BUILDINGS[key];
  if(!b) return false;
  const level = slice.buildings[key] || 0;
  if(level >= b.maxLevel) return false;
  const cost = getBuildingCost(key, level + 1);
  for(const [res, amt] of Object.entries(cost)){
    if((state[res] || 0) < amt) return false;
  }
  for(const [res, amt] of Object.entries(cost)){
    state[res] -= amt;
  }
  slice.buildings[key] = level + 1;
  recalculateBuildingBonuses(state);
  return true;
}

export function setBuildingLevel(state, key, level = 1){
  const slice = state.sect || sectState;
  if(level <= 0) return;
  slice.buildings[key] = level;
  recalculateBuildingBonuses(state);
}
