import { S } from '../../shared/state.js';
import { log } from '../../shared/utils/dom.js';

export function getGatheringRate(resource, state = S) {
  const baseRates = {
    wood: 3,
    herbs: 2,
  };
  const levelBonus = state.gathering?.level ? state.gathering.level * 0.1 : 0;
  return (baseRates[resource] || 1) * (1 + levelBonus);
}

export function selectResource(resource, state = S) {
  if (!state.gathering) return;
  if (state.gathering.unlockedResources?.includes(resource)) {
    state.gathering.selectedResource = resource;
    state.gathering.resourcesGained = 0;
    log?.(`Switched gathering to ${resource}`, 'good');
  }
}

export function advanceGathering(state = S) {
  if (!state.activities?.gathering || !state.gathering?.selectedResource) return;
  const totalRate = getGatheringRate(state.gathering.selectedResource, state);
  switch (state.gathering.selectedResource) {
    case 'wood':
      state.wood = (state.wood || 0) + totalRate;
      if (Math.random() < 0.05) {
        state.spiritWood = (state.spiritWood || 0) + 1;
        log?.('You found Spirit Wood!', 'good');
      }
      break;
    case 'herbs':
      state.herbs = (state.herbs || 0) + totalRate;
      if (Math.random() < 0.05) {
        state.aromaticHerb = (state.aromaticHerb || 0) + 1;
        log?.('You found an Aromatic Herb!', 'good');
      }
      break;
  }
  state.gathering.resourcesGained = (state.gathering.resourcesGained || 0) + totalRate;
  const expGain = 0.5;
  state.gathering.exp += expGain;
  if (state.gathering.exp >= state.gathering.expMax) {
    state.gathering.level++;
    state.gathering.exp = 0;
    state.gathering.expMax = Math.floor(state.gathering.expMax * 1.3);
    log?.(`Gathering level up! Level ${state.gathering.level}`, 'good');
  }
}
