import { karmaState } from './state.js';

function slice(state){
  return state.karma || state;
}

export function addKarmaPoints(amount, state = karmaState){
  const k = slice(state);
  k.points = (k.points || 0) + amount;
  return k.points;
}

export function applyKarmaBonus(key, value, state = karmaState){
  const k = slice(state);
  k[key] = (k[key] || 0) + value;
  return k[key];
}
