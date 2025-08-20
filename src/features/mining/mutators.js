import { S } from '../../shared/state.js';
import { selectResource as logicSelectResource, advanceMining as logicAdvanceMining } from './logic.js';

export function selectResource(resource, state = S) {
  logicSelectResource(resource, state);
}

export function advanceMining(state = S) {
  logicAdvanceMining(state);
}
