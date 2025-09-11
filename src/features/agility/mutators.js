import { agilityState } from './state.js';
import { stepTrainingCursor, evaluateTrainingHit, getAgilityEffects } from './logic.js';
import { ACCURACY_BASE, DODGE_BASE } from '../combat/hit.js';

function slice(state){
  return state.agility || state;
}

export function addAgilityExp(amount, state = agilityState){
  const p = slice(state);
  const mult = 1 + (p.obstacleCourses || 0) * 0.1;
  p.exp = (p.exp || 0) + amount * mult;
  while(p.exp >= p.expMax){
    p.exp -= p.expMax;
    p.level++;
    p.expMax = Math.floor(p.expMax * 1.4);
    if(state.attributes){
      state.attributes.agility = (state.attributes.agility || 10) + 1;
      const { accuracyBonus, dodgeBonus } = getAgilityEffects(state);
      state.derivedStats = state.derivedStats || {};
      state.derivedStats.accuracy = ACCURACY_BASE + accuracyBonus;
      state.derivedStats.dodge = DODGE_BASE + dodgeBonus;
    }
  }
  return p.exp;
}

export function consumeAgilityStamina(amount, state = agilityState){
  const p = slice(state);
  p.stamina = Math.max(0, (p.stamina || 0) - amount);
  return p.stamina;
}

export function regenAgilityStamina(amount, state = agilityState){
  const p = slice(state);
  p.stamina = Math.min(p.maxStamina, (p.stamina || 0) + amount);
  return p.stamina;
}

export function trainAgility(state = agilityState){
  const root = state;
  if(!root.activities?.agility){
    return { message: 'You must be training agility to practice!', type: 'bad' };
    }
  const baseExp = 5 + Math.floor(Math.random() * 10);
  const expGain = Math.floor(baseExp);
  addAgilityExp(expGain, state);
  return { message: `Training session complete! +${expGain} agility exp`, type: 'good' };
}

export function startTrainingSession(state = agilityState){
  const p = slice(state);
  if(p.stamina < 20) return false;
  p.trainingSession = true;
  p.timingActive = true;
  p.sessionStamina = p.stamina;
  p.sessionHits = 0;
  p.sessionXP = 0;
  p.cursorPosition = 0;
  p.cursorDirection = 1;
  p.cursorSpeed = 7;
  p.hitStreak = 0;
  p.perfectHits = 0;
  return true;
}

export function endTrainingSession(state = agilityState){
  const p = slice(state);
  if(!p.trainingSession) return null;
  p.trainingSession = false;
  p.timingActive = false;
  const summary = { hits: p.sessionHits, xp: Math.floor(p.sessionXP) };
  p.sessionStamina = 0;
  p.sessionHits = 0;
  p.sessionXP = 0;
  p.hitStreak = 0;
  p.perfectHits = 0;
  p.cursorSpeed = 0;
  return summary;
}

export function moveTrainingCursor(state = agilityState, dt = 1){
  const p = slice(state);
  if(!p.timingActive || !p.trainingSession) return;
  if(!p.cursorSpeed) p.cursorSpeed = 5;
  const speed = p.cursorSpeed * 3 * dt;
  const { position, direction } = stepTrainingCursor(p.cursorPosition, p.cursorDirection, speed);
  p.cursorPosition = position;
  p.cursorDirection = direction;
}

export function hitTrainingTarget(state = agilityState){
  const p = slice(state);
  if(!p.trainingSession || !p.timingActive) return { message: '', color: '' };
  const result = evaluateTrainingHit(p.cursorPosition, p.hitStreak || 0);
  p.hitStreak = result.hitStreak;
  p.perfectHits = (p.perfectHits || 0) + result.perfectHits;
  p.sessionHits = (p.sessionHits || 0) + 1;
  p.sessionXP = (p.sessionXP || 0) + result.xpGain;
  addAgilityExp(result.xpGain, state);
  p.cursorSpeed = Math.min((p.cursorSpeed || 0) + 1.5, 25);
  return { message: result.hitMessage, color: result.hitColor };
}

export function tickAgilityTraining(state = agilityState){
  const p = slice(state);
  if(p.trainingSession){
    p.sessionStamina -= 6;
    consumeAgilityStamina(6, state);
    if(p.sessionStamina <= 0 || p.stamina <= 0){
      return endTrainingSession(state);
    }
  }else{
    regenAgilityStamina(0.03 * (1 + (state.attributes?.agility || 10) * 0.1), state);
  }
  return null;
}

export function buildObstacleCourse(state = agilityState){
  const p = slice(state);
  const count = p.obstacleCourses || 0;
  const stoneCost = Math.floor(50 * Math.pow(1.5, count));
  const woodCost = Math.floor(50 * Math.pow(1.5, count));
  if((state.stones||0) < stoneCost || (state.wood||0) < woodCost){
    return false;
  }
  state.stones -= stoneCost;
  state.wood -= woodCost;
  p.obstacleCourses = count + 1;
  return true;
}
