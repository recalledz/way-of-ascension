import { stopActivity as stopActivityMut } from '../activity/mutators.js';

export function advanceCatching(state){
  const root = state.catching || state;
  if(!root) return;
  const now = Date.now();

  // Catch progress
  if(root.currentCatch){
    if(!state.activities?.catching){
      root.currentCatch = null;
    } else {
      const cc = root.currentCatch;
      const elapsed = now - cc.start;
      cc.progress = Math.min(1, elapsed / cc.duration);
      if(elapsed >= cc.duration){
        root.currentCatch = null;
        stopActivityMut(state, 'catching');
        if(Math.random() < cc.chance){
          root.creatures.push({
            id: `${cc.area.id}-${now}`,
            name: cc.enemy,
            icon: cc.icon,
            hunger: 1,
            tameProgress: 0,
            lastFed: now,
            lastTameAttempt: 0,
            tamed: false
          });
        }
      }
    }
  }

  // Hunger decay
  if(!root.creatures) return;
  const interval = 3 * 60 * 60 * 1000; // 3 hours
  root.creatures.forEach(cr => {
    const elapsed = now - (cr.lastFed || now);
    const hungerLoss = (elapsed / interval) * 0.2;
    const newHunger = Math.max(0, 1 - hungerLoss);
    if(newHunger < (cr.hunger ?? 1)){
      cr.hunger = newHunger;
    }
  });
}
