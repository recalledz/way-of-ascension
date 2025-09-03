import { agilityState } from './state.js';
import { getAgilityEffects } from './logic.js';

function slice(state){
  return state.agility || state;
}

export function getAgilityLevel(state = agilityState){
  return slice(state).level || 1;
}

export function getAgilityExp(state = agilityState){
  return slice(state).exp || 0;
}

export function getAgilityExpMax(state = agilityState){
  return slice(state).expMax || 100;
}

export function getAgilityStamina(state = agilityState){
  return slice(state).stamina || 0;
}

export function getAgilityMaxStamina(state = agilityState){
  return slice(state).maxStamina || 0;
}

export function getAgilityBonuses(state){
  return getAgilityEffects(state);
}

export function isAgilityTraining(state = agilityState){
  return !!slice(state).trainingSession;
}

export function getTrainingSessionStats(state = agilityState){
  const p = slice(state);
  return {
    sessionStamina: p.sessionStamina || 0,
    sessionHits: p.sessionHits || 0,
    sessionXP: p.sessionXP || 0,
  };
}

export function getTrainingCursorPosition(state = agilityState){
  return slice(state).cursorPosition || 0;
}

export function getObstacleCourses(state = agilityState){
  return slice(state).obstacleCourses || 0;
}
