import { S } from '../../shared/state.js';
import { log } from '../../shared/utils/dom.js';

export function getMiningRate(resource, state = S) {
  const baseRates = {
    stones: 3,
    iron: 1.5,
    ice: 0.75,
  };
  const levelBonus = state.mining?.level ? state.mining.level * 0.1 : 0;
  return (baseRates[resource] || 1) * (1 + levelBonus);
}

export function selectResource(resource, state = S) {
  if (!state.mining) return;
  if (state.mining.unlockedResources?.includes(resource)) {
    state.mining.selectedResource = resource;
    state.mining.resourcesGained = 0;
    log?.(`Switched mining to ${resource}`, 'good');
  }
}

export function advanceMining(state = S) {
  if (!state.activities?.mining || !state.mining?.selectedResource) return;
  const totalRate = getMiningRate(state.mining.selectedResource, state);
  switch (state.mining.selectedResource) {
    case 'stones':
      state.stones = (state.stones || 0) + totalRate;
      break;
    case 'iron':
      state.iron = (state.iron || 0) + totalRate;
      break;
    case 'ice':
      state.ice = (state.ice || 0) + totalRate;
      break;
  }
  state.mining.resourcesGained = (state.mining.resourcesGained || 0) + totalRate;
  const expGain = 0.5;
  state.mining.exp += expGain;
  if (state.mining.exp >= state.mining.expMax) {
    state.mining.level++;
    state.mining.exp = 0;
    state.mining.expMax = Math.floor(state.mining.expMax * 1.3);
    log?.(`Mining level up! Level ${state.mining.level}`, 'good');
  }
}
