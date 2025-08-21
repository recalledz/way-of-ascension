import { S } from '../../shared/state.js';

export function toggleAutoMeditate(value, state = S) {
  state.auto = state.auto || {};
  if (typeof value === 'boolean') {
    state.auto.meditate = value;
  } else {
    state.auto.meditate = !state.auto.meditate;
  }
}

export function toggleAutoAdventure(value, state = S) {
  state.auto = state.auto || {};
  if (typeof value === 'boolean') {
    state.auto.adventure = value;
  } else {
    state.auto.adventure = !state.auto.adventure;
  }
}
