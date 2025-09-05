import { catchingState } from './state.js';
import { tickCreatures } from './logic.js';
import { registerFeature } from '../registry.js';

export const CatchingFeature = {
  key: 'catching',
  initialState: () => ({ ...catchingState, _v: 0 })
};

registerFeature({
  id: 'catching',
  init: () => ({ ...catchingState, _v: 0 }),
  tick: (state, stepMs) => {
    if(!state.catching) return;
    tickCreatures(state.catching, stepMs);
  }
});
