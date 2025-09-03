import { agilityState } from './state.js';

function slice(state){
  return state.agility || state;
}

export function getAgilityEffects(state){
  const root = state.stats ? state : { stats: { agility: 10 } };
  const current = root.stats.agility || 10;
  const accuracyBonus = current;
  const dodgeBonus = current;
  const forgeSpeed = current * 0.02; // 2% speed per agility
  return { accuracyBonus, dodgeBonus, forgeSpeed };
}

export function getSlice(state = agilityState){
  return slice(state);
}
