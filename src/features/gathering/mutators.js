import { S } from '../../shared/state.js';
import { on } from '../../shared/events.js';
import { gatheringState } from './state.js';
import { advanceGathering as logicAdvanceGathering } from './logic.js';

on('ACTIVITY:START', ({ root, name }) => {
  if (name !== 'gathering') return;
  root.gathering ??= { ...gatheringState };
});

export function advanceGathering(state = S) {
  logicAdvanceGathering(state);
}
