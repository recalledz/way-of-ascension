import { S } from '../../shared/state.js';
import { alchemyState } from './state.js';
import { getBuildingBonuses } from '../sect/selectors.js';
import { ALCHEMY_RECIPES } from './data/recipes.js';

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

export function inspectPillResistance(lineKey, tier = 1, state = S) {
  const recipe = ALCHEMY_RECIPES[lineKey];
  if (recipe?.type !== 'permanent') return null;
  const resDef = recipe.resistance || { rpCap: 0, baseRp: 0, tierWeight: 1 };
  const res = slice(state).resistance?.[lineKey] || { rp: 0, rpCap: resDef.rpCap };
  const rp = res.rp || 0;
  const rpCap = res.rpCap || resDef.rpCap || 0;
  const effectVal = Object.values(recipe.effects?.stats || {})[0] || 0;
  const tierWeight = resDef.tierWeight ?? 1;
  const effectiveMultiplier = rp >= rpCap ? 0 : effectVal / (1 + rp);
  const rpGain = resDef.baseRp * tierWeight;
  const nextRp = Math.min(rp + rpGain, rpCap);
  const predictedGain = nextRp >= rpCap ? 0 : effectVal / (1 + nextRp);
  return { rp, rpCap, effectiveMultiplier, nextGain: predictedGain };
}

export function getSuccessBonus(state = S) {
  const building = getBuildingBonuses(state).alchemySuccess || 0;
  const mind = (state.stats?.mind || 10) - 10;
  return building + mind * 0.04;
}
