import { karmaState } from './state.js';

function slice(state){
  return state.karma || state;
}

export function getKarmaPoints(state = karmaState){
  return slice(state).points || 0;
}

export function getKarmaBonuses(state = karmaState){
  const k = slice(state);
  return {
    qiRegen: k.qiRegen || 0,
    atk: k.atk || 0,
    def: k.def || 0,
  };
}

export function getQiRegenBonus(state = karmaState){
  return getKarmaBonuses(state).qiRegen;
}

export function getAtkBonus(state = karmaState){
  return getKarmaBonuses(state).atk;
}

export function getDefBonus(state = karmaState){
  return getKarmaBonuses(state).def;
}
