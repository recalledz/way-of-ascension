import { S } from '../../shared/state.js';
import { getGatheringRate as logicGetGatheringRate } from './logic.js';

export function getGatheringState(state = S) {
  return state.gathering || {
    level: 1,
    exp: 0,
    expMax: 100,
    resourcesGained: 0,
  };
}

export function getGatheringRate(state = S) {
  return logicGetGatheringRate(state);
}
