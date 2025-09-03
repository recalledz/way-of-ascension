import { agilityState } from './state.js';
import { recomputePlayerTotals } from '../inventory/logic.js';

function slice(state){
  return state.agility || state;
}

export function addAgilityExp(amount, state = agilityState){
  const a = slice(state);
  a.exp = (a.exp || 0) + amount;
  while(a.exp >= a.expMax){
    a.exp -= a.expMax;
    a.level++;
    a.expMax = Math.floor(a.expMax * 1.4);
    if(state.stats){
      state.stats.agility = (state.stats.agility || 10) + 1;
      recomputePlayerTotals(state);
    }
  }
  return a.exp;
}

export function tickAgilityTraining(state = agilityState){
  const root = state;
  if(!root.activities?.agility) return;
  const a = slice(state);
  const mult = 1 + (a.obstacleCourses || 0) * 0.1;
  addAgilityExp(5 * mult, state);
}

export function buildObstacleCourse(state = agilityState){
  const root = state;
  const a = slice(state);
  const count = a.obstacleCourses || 0;
  const stoneCost = Math.floor(50 * Math.pow(1.5, count));
  const woodCost = Math.floor(30 * Math.pow(1.5, count));
  if((root.stones || 0) < stoneCost || (root.wood || 0) < woodCost) return false;
  root.stones -= stoneCost;
  root.wood -= woodCost;
  a.obstacleCourses = count + 1;
  return true;
}
