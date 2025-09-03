import { agilityState } from './state.js';

function slice(state){
  return state.agility || state;
}

export function getAgilityLevel(state = agilityState){
  return slice(state).level;
}

export function getAgilityExp(state = agilityState){
  return slice(state).exp;
}

export function getAgilityExpMax(state = agilityState){
  return slice(state).expMax;
}

export function getObstacleCourses(state = agilityState){
  return slice(state).obstacleCourses || 0;
}
