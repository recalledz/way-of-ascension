import { S } from '../../shared/state.js';

export function getForgingState(state = S) {
  return state.forging || { level: 1, exp: 0, expMax: 100, current: null };
}
