import { S } from '../../shared/state.js';
import { getGatheringRate as logicGetGatheringRate } from './logic.js';

export function getGatheringState(state = S) {
  return state.gathering || {
    level: 1,
    exp: 0,
    expMax: 100,
    unlockedResources: ['wood'],
    selectedResource: 'wood',
    resourcesGained: 0,
  };
}

export function getGatheringRate(resource, state = S) {
  return logicGetGatheringRate(resource, state);
}
