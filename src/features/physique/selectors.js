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

export function isPhysiqueTraining(state = physiqueState){
  return !!slice(state).trainingSession;
}

export function getTrainingSessionStats(state = physiqueState){
  const p = slice(state);
  return {
    sessionStamina: p.sessionStamina || 0,
    sessionHits: p.sessionHits || 0,
    sessionXP: p.sessionXP || 0,
  };
}

export function getTrainingCursorPosition(state = physiqueState){
  return slice(state).cursorPosition || 0;
}
