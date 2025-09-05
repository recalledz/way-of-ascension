export function advanceCatching(state){
  const root = state.catching || state;
  if(!root?.creatures) return;
  const now = Date.now();
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
