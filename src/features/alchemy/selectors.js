import { S } from '../../shared/state.js';
import { alchemyState } from './state.js';
import { getBuildingBonuses } from '../sect/selectors.js';

function slice(state = S) {
  return state.alchemy || alchemyState;
}

export function getAlchemyLevel(state = S) {
  return slice(state).level;
}

export function getLab(state = S) {
  return slice(state).lab;
}

export function getKnownRecipes(state = S) {
  return slice(state).knownRecipes;
}

export function getOutputs(state = S) {
  return slice(state).outputs;
}

export function getResistanceFor(lineKey, state = S) {
  return slice(state).resistance?.[lineKey] || { rp: 0, rpCap: 0 };
}

export function getSuccessBonus(state = S) {
  const building = getBuildingBonuses(state).alchemySuccess || 0;
  const mind = (state.stats?.mind || 10) - 10;
  return building + mind * 0.04;
}
