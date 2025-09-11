import { agilityState } from './state.js';

function slice(state){
  return state.agility || state;
}

export function getAgilityEffects(state){
  const root = state.attributes ? state : { attributes: { agility: 10 } };
  const current = root.attributes.agility || 10;
  const accuracyBonus = Math.floor(current * 2);
  const dodgeBonus = Math.floor(current * 0.5);
  const forgeSpeed = 1 + current * 0.02;
  return { accuracyBonus, dodgeBonus, forgeSpeed };
}

export function getSlice(state = agilityState){
  return slice(state);
}

export function stepTrainingCursor(position, direction, speed){
  let pos = position + direction * speed;
  let dir = direction;
  if(pos >= 100){ pos = 100; dir = -1; }
  else if(pos <= 0){ pos = 0; dir = 1; }
  return { position: pos, direction: dir };
}

export function evaluateTrainingHit(cursorPosition, hitStreak){
  const perfectZoneStart = 45;
  const perfectZoneEnd = 55;
  const goodZoneStart = 35;
  const goodZoneEnd = 65;

  let xpGain = 3 + Math.random() * 2;
  let hitMessage = 'Poor timing!';
  let hitColor = '#dc2626';
  let streak = hitStreak;
  let perfectHits = 0;

  if(cursorPosition >= perfectZoneStart && cursorPosition <= perfectZoneEnd){
    xpGain = 15 + Math.random() * 10;
    hitMessage = 'PERFECT!';
    hitColor = '#22c55e';
    streak += 1;
    perfectHits = 1;
  }else if(cursorPosition >= goodZoneStart && cursorPosition <= goodZoneEnd){
    xpGain = 8 + Math.random() * 4;
    hitMessage = 'Good!';
    hitColor = '#f59e0b';
    streak = Math.max(0, streak - 1);
  }else{
    streak = 0;
  }

  const streakBonus = Math.min(streak * 0.05, 0.5);
  xpGain *= (1 + streakBonus);

  return { xpGain, hitMessage, hitColor, hitStreak: streak, perfectHits };
}
