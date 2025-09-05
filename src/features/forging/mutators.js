import { S } from '../../shared/state.js';
import { startForging as logicStart, advanceForging as logicAdvance, imbueItem as logicImbue } from './logic.js';

export function startForging(itemId, element, state = S) {
  logicStart(itemId, element, state);
}

export function advanceForging(state = S) {
  logicAdvance(state);
}

export function imbueItem(itemId, element, state = S) {
  logicImbue(itemId, element, state);
}
