import { karmaState } from './state.js';

function slice(state){
  return state?.karma || state;
}

export function karmaQiRegenBonus(state = karmaState){
  const k = slice(state);
  return (k.qiRegen || 0) * 10;
}

export function karmaAtkBonus(state = karmaState){
  const k = slice(state);
  return (k.atk || 0) * 100;
}

export function karmaDefBonus(state = karmaState){
  const k = slice(state);
  return (k.def || 0) * 100;
}
