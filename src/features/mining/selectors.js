import { S } from '../../shared/state.js';
import { getMiningRate as logicGetMiningRate } from './logic.js';

export function getMiningState(state = S) {
  return state.mining || {
    level: 1,
    exp: 0,
    expMax: 100,
    unlockedResources: ['stones'],
    selectedResource: 'stones',
    resourcesGained: 0,
  };
}

export function getMiningRate(resource, state = S) {
  return logicGetMiningRate(resource, state);
}
