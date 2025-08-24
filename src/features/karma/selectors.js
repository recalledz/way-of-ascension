import { karmaState } from './state.js';
import { S } from '../../shared/state.js';

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
    armor: k.armor || 0,
  };
}

export function getQiRegenBonus(state = karmaState){
  return getKarmaBonuses(state).qiRegen;
}

export function getAtkBonus(state = karmaState){
  return getKarmaBonuses(state).atk;
}

export function getArmorBonus(state = karmaState){
  return getKarmaBonuses(state).armor;
}

export function calcKarmaGain(state = S) {
  const tier = state.realm?.tier || 0;
  const stage = state.realm?.stage || 1;
  const score = (tier * 9 + (stage - 1)) - 3;
  return Math.max(0, Math.floor(score / 6));
}
