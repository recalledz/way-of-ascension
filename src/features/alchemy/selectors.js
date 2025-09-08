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
  const perm = recipe?.permanent;
  if (!perm) return null;
  const res = slice(state).resistance?.[lineKey] || { rp: 0, rpCap: perm.rpCap };
  const rp = res.rp || 0;
  const rpCap = res.rpCap || perm.rpCap || 0;
  const tierDef = perm.tiers?.[tier] || {};
  const tierMult = tierDef.tierMultiplier ?? 1;
  const tierWeight = tierDef.tierWeight ?? 1;
  const effectiveMultiplier = rp >= rpCap ? 0 : perm.baseMultiplier * tierMult / (1 + rp);
  const rpGain = perm.baseRp * tierWeight;
  const nextRp = Math.min(rp + rpGain, rpCap);
  const predictedGain = nextRp >= rpCap ? 0 : perm.baseMultiplier * tierMult / (1 + nextRp);
  return { rp, rpCap, effectiveMultiplier, nextGain: predictedGain };
}

export function getSuccessBonus(state = S) {
  const building = getBuildingBonuses(state).alchemySuccess || 0;
  const mind = (state.stats?.mind || 10) - 10;
  return building + mind * 0.04;
}
