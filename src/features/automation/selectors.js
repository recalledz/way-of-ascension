import { S } from '../../shared/state.js';

export function isAutoMeditate(state = S) {
  return !!state.auto?.meditate;
}

export function isAutoAdventure(state = S) {
  return !!state.auto?.adventure;
}
