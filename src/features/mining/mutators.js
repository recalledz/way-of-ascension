import { S } from '../../shared/state.js';
import { on } from '../../shared/events.js';
import { miningState } from './state.js';
import { selectResource as logicSelectResource, advanceMining as logicAdvanceMining } from './logic.js';

// Initialize defaults when mining starts
on('ACTIVITY:START', ({ root, name }) => {
  if (name !== 'mining') return;
  root.mining ??= {
    ...miningState,
    unlockedResources: [...miningState.unlockedResources],
    selectedResource: root.mining?.selectedResource || miningState.selectedResource,
  };
});

export function selectResource(resource, state = S) {
  logicSelectResource(resource, state);
}

export function advanceMining(state = S) {
  logicAdvanceMining(state);
}
