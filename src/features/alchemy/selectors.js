import { alchemyState } from './state.js';
import { getBuildingBonuses } from '../sect/selectors.js';

function slice(state){
  return state.alchemy || alchemyState;
}

export function getAlchemyLevel(state = alchemyState){
  return slice(state).level;
}

export function getLab(state = alchemyState){
  return slice(state).lab;
}

export function getKnownRecipes(state = alchemyState){
  return slice(state).knownRecipes;
}

export function getOutputs(state = alchemyState){
  return slice(state).outputs;
}

export function getResistanceFor(lineKey, state = alchemyState){
  const res = slice(state).resistance || {};
  return res[lineKey] || { rp: 0, rpCap: 0 };
}

export function getSuccessBonus(state = alchemyState){
  const building = getBuildingBonuses(state).alchemySuccess || 0;
  const mind = (state.stats?.mind || 10) - 10;
  const mindBonus = mind * 0.04;
  return building + mindBonus;
}
