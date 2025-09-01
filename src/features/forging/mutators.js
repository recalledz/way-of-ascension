import { S } from '../../shared/state.js';
import { startForging as logicStart, advanceForging as logicAdvance } from './logic.js';

export function startForging(itemId, element, state = S) {
  logicStart(itemId, element, state);
}

export function advanceForging(state = S) {
  logicAdvance(state);
}
