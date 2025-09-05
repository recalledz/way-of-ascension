import { ZONES } from '../adventure/data/zones.js';
import { getIcon } from './data.js';

export function advanceCatching(state){
  const root = state.catching || state;
  if(!root) return;
  const now = Date.now();
  const interval = 3 * 60 * 60 * 1000; // 3 hours
  root.creatures?.forEach(cr => {
    const elapsed = now - (cr.lastFed || now);
    const hungerLoss = (elapsed / interval) * 0.2;
    const newHunger = Math.max(0, 1 - hungerLoss);
    if(newHunger < (cr.hunger ?? 1)){
      cr.hunger = newHunger;
    }
  });

  const attempt = root.currentAttempt;
  if(attempt){
    if(!state.activities?.catching){
      root.currentAttempt = null;
    } else if(now - attempt.start >= attempt.duration){
      const zone = ZONES[attempt.zi];
      const area = zone?.areas?.[attempt.ai];
      const stage = attempt.stage;
      const chance = Math.pow(0.5, stage);
      if(area && Math.random() < chance){
        root.creatures.push({
          id: `${area.id}-${Date.now()}`,
          name: area.enemy,
          icon: getIcon(area.enemy),
          hunger: 1,
          tameProgress: 0,
          lastFed: Date.now(),
          lastTameAttempt: 0,
          tamed: false
        });
      }
      root.currentAttempt = null;
      if(state.activities) state.activities.catching = false;
    }
  }
}

export function attemptTame(creature){
  const now = Date.now();
  if(now - (creature.lastTameAttempt || 0) < 3600 * 1000) return;
  creature.lastTameAttempt = now;
  if(Math.random() < (creature.tameProgress || 0) / 100){
    creature.tamed = true;
    creature.tameProgress = 100;
  }
}
