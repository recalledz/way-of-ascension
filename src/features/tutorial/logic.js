import { on } from '../../shared/events.js';
import { log } from '../../shared/utils/dom.js';

let prevFoundation = 0;
let prevBreak = false;

export function initTutorial(state) {
  prevFoundation = state.foundation;
  prevBreak = state.breakthrough?.inProgress || false;

  on('ACTIVITY:START', ({ name }) => {
    if (name === 'cultivation' && state.tutorial.step === 0) {
      state.tutorial.step = 1;
      log('You start cultivating. Foundation will begin to grow.', 'good');
    }
  });
}

export function tickTutorial(state) {
  if (!state.tutorial || state.tutorial.completed) return;

  if (state.tutorial.step === 1 && state.foundation > prevFoundation) {
    state.tutorial.step = 2;
    log('Foundation accumulates. Fill it to attempt a breakthrough.', 'neutral');
  }

  if (state.tutorial.step === 2 && !prevBreak && state.breakthrough?.inProgress) {
    state.tutorial.step = 3;
    log('Breakthrough underway! Succeed to reach the next stage.', 'neutral');
  }

  if (state.tutorial.step === 3 && state.realm.tier >= 1) {
    state.tutorial.completed = true;
    log('You have reached Qi Refining stage 1. Tutorial complete!', 'good');
  }

  prevFoundation = state.foundation;
  prevBreak = state.breakthrough?.inProgress || false;
}
