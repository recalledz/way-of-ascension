import { log } from '../../shared/utils/dom.js';
import { OBJECTIVES } from './objectives.js';

export function tickTutorial(state) {
  const t = state.tutorial;
  if (!t || t.completed) return;
  const obj = OBJECTIVES[t.step];
  if (!obj) {
    t.completed = true;
    return;
  }
  if (!t.claimable && obj.check(state)) {
    t.claimable = true;
    log?.('Objective complete! Claim your reward.', 'good');
  }
}

export function resetTutorial(state) {
  state.tutorial = { step: 0, completed: false, claimable: false };
}
