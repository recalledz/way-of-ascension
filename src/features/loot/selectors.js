import { S } from '../../game/state.js';

export function getSessionLoot(state = S) {
  return state.sessionLoot || [];
}

export function hasPendingLoot(state = S) {
  return getSessionLoot(state).length > 0;
}
