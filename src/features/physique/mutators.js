import { physiqueState } from './state.js';
import { stepTrainingCursor, evaluateTrainingHit } from './logic.js';

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
    if(state.stats){
      state.stats.physique = (state.stats.physique || 10) + 1;
      p.maxStamina = (state.stats.physique || 10) * 10;
      p.stamina = Math.min(p.stamina || 0, p.maxStamina);
    }else{
      p.maxStamina += 10;
      p.stamina = Math.min(p.stamina || 0, p.maxStamina);
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

export function trainPhysique(state = physiqueState){
  const root = state;
  if(!root.activities?.physique){
    return { message: 'You must be training physique to use the training dummy!', type: 'bad' };
  }
  const baseExp = 5 + Math.floor(Math.random() * 10);
  const expGain = Math.floor(baseExp * (1 + ((root.stats?.physique || 10) - 10) * 0.1));
  addPhysiqueExp(expGain, state);
  return { message: `Training session complete! +${expGain} physique exp`, type: 'good' };
}

export function startTrainingSession(state = physiqueState){
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

export function endTrainingSession(state = physiqueState){
  const p = slice(state);
  if(!p.trainingSession) return null;
  p.trainingSession = false;
  p.timingActive = false;
  const summary = { hits: p.sessionHits, xp: Math.floor(p.sessionXP) };
  const performance = p.sessionHits ? (p.perfectHits || 0) / p.sessionHits : 0;
  if(state.qi !== undefined && state.qiMax){
    const chance = performance;
    const recoverPct = performance * 0.2; // up to 20% of max qi
    if(Math.random() < chance){
      const recovered = state.qiMax * recoverPct;
      state.qi = Math.min(state.qiMax, (state.qi || 0) + recovered);
      summary.qiRecovered = recovered;
    }else{
      summary.qiRecovered = 0;
    }
  }
  p.sessionStamina = 0;
  p.sessionHits = 0;
  p.sessionXP = 0;
  p.hitStreak = 0;
  p.perfectHits = 0;
  p.cursorSpeed = 0;
  return summary;
}

export function moveTrainingCursor(state = physiqueState){
  const p = slice(state);
  if(!p.timingActive || !p.trainingSession) return;
  if(!p.cursorSpeed) p.cursorSpeed = 5;
  const speed = p.cursorSpeed * 3; // Triple cursor movement speed
  const { position, direction } = stepTrainingCursor(p.cursorPosition, p.cursorDirection, speed);
  p.cursorPosition = position;
  p.cursorDirection = direction;
}

export function hitTrainingTarget(state = physiqueState){
  const p = slice(state);
  if(!p.trainingSession || !p.timingActive) return { message: '', color: '' };
  const result = evaluateTrainingHit(p.cursorPosition, p.hitStreak || 0);
  p.hitStreak = result.hitStreak;
  p.perfectHits = (p.perfectHits || 0) + result.perfectHits;
  p.sessionHits = (p.sessionHits || 0) + 1;
  p.sessionXP = (p.sessionXP || 0) + result.xpGain;
  addPhysiqueExp(result.xpGain, state);
  p.cursorSpeed = Math.min((p.cursorSpeed || 0) + 1.5, 25);
  return { message: result.hitMessage, color: result.hitColor };
}

export function tickPhysiqueTraining(state = physiqueState){
  const p = slice(state);
  if(p.trainingSession){
    p.sessionStamina -= 6;
    consumePhysiqueStamina(6, state);
    if(p.sessionStamina <= 0 || p.stamina <= 0){
      return endTrainingSession(state);
    }
    if(p.timingActive){
      moveTrainingCursor(state);
    }
  }else{
    regenPhysiqueStamina(1, state);
    const passiveRate = (2 + (p.level * 0.2)) / 3;
    addPhysiqueExp(passiveRate, state);
    p.passiveXpGained = (p.passiveXpGained || 0) + passiveRate;
  }
  return null;
}
