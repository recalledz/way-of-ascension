import { log } from '../../shared/utils/dom.js';

export function getCrittersForLocation(location, state){
  return state.catching.availableCritters[location] || [];
}

export function catchCritter(location, critterId, state){
  const critters = getCrittersForLocation(location, state);
  const data = critters.find(c => c.id === critterId);
  if(!data) return false;
  const chance = Math.pow(0.7, data.stage - 1); // exponential decrease
  if(Math.random() <= chance){
    state.catching.captured.push({
      id: data.id,
      name: data.name,
      icon: data.icon,
      stage: data.stage,
      location,
      hunger: 100,
      tameProgress: 0,
      lastFed: Date.now(),
      lastTamed: 0,
      tamed: false
    });
    log(`Caught a ${data.name}!`, 'good');
    return true;
  }
  log(`Failed to catch the ${data.name}.`, 'bad');
  return false;
}

export function feedCreature(id, state){
  const creature = state.catching.captured.find(c => c.id === id);
  if(!creature) return;
  creature.hunger = 100;
  creature.lastFed = Date.now();
  creature.tameProgress = Math.min(100, creature.tameProgress + 20);
}

export function tameCreature(id, state){
  const creature = state.catching.captured.find(c => c.id === id);
  if(!creature || creature.tamed) return;
  const now = Date.now();
  if(now - creature.lastTamed < 60 * 60 * 1000) return; // once per hour
  creature.lastTamed = now;
  const chance = creature.tameProgress / 100;
  if(Math.random() <= chance){
    creature.tamed = true;
  }
}

export function tickCreatures(catching, stepMs){
  const decay = (stepMs / (3 * 60 * 60 * 1000)) * 20; // 20% per 3 hours
  catching.captured.forEach(c => {
    c.hunger = Math.max(0, c.hunger - decay);
  });
}
