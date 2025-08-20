import { physiqueState } from './state.js';
import { getPhysiqueEffects } from './logic.js';

function slice(state){
  return state.physique || state;
}

export function getPhysiqueLevel(state = physiqueState){
  return slice(state).level || 1;
}

export function getPhysiqueExp(state = physiqueState){
  return slice(state).exp || 0;
}

export function getPhysiqueExpMax(state = physiqueState){
  return slice(state).expMax || 100;
}

export function getPhysiqueStamina(state = physiqueState){
  return slice(state).stamina || 0;
}

export function getPhysiqueMaxStamina(state = physiqueState){
  return slice(state).maxStamina || 0;
}

export function getPhysiqueBonuses(state){
  return getPhysiqueEffects(state);
}
