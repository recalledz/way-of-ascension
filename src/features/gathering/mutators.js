import { S } from '../../shared/state.js';
import { on } from '../../shared/events.js';
import { gatheringState } from './state.js';
import { selectResource as logicSelectResource, advanceGathering as logicAdvanceGathering } from './logic.js';

// Initialize defaults when gathering starts
on('ACTIVITY:START', ({ root, name }) => {
  if (name !== 'gathering') return;
  root.gathering ??= {
    ...gatheringState,
    unlockedResources: [...gatheringState.unlockedResources],
    selectedResource: root.gathering?.selectedResource || gatheringState.selectedResource,
  };
});

export function selectResource(resource, state = S) {
  logicSelectResource(resource, state);
}

export function advanceGathering(state = S) {
  logicAdvanceGathering(state);
}
