import { physiqueState } from './state.js';

function slice(state){
  return state.physique || state;
}

export function addPhysiqueExp(amount, state = physiqueState){
  const p = slice(state);
  p.exp = (p.exp || 0) + amount;
  while(p.exp >= p.expMax){
    p.exp -= p.expMax;
    p.level++;
    p.expMax = Math.floor(p.expMax * 1.4);
    p.maxStamina += 10;
    if(state.stats){
      state.stats.physique = (state.stats.physique || 10) + 1;
    }
  }
  return p.exp;
}

export function consumePhysiqueStamina(amount, state = physiqueState){
  const p = slice(state);
  p.stamina = Math.max(0, (p.stamina || 0) - amount);
  return p.stamina;
}

export function regenPhysiqueStamina(amount, state = physiqueState){
  const p = slice(state);
  p.stamina = Math.min(p.maxStamina, (p.stamina || 0) + amount);
  return p.stamina;
}
