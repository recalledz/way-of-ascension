import { log } from '../../shared/utils/dom.js';

const STEP_TEXT = [
  'Begin cultivating to start your journey.',
  'Foundation grows. Accumulate enough to advance.',
  'Attempt a breakthrough when you are ready.',
  'Reach Stage 1 of the next realm to finish.',
];

export function tickTutorial(state) {
  const t = state.tutorial;
  if (!t || t.completed) return;
  switch (t.step) {
    case 0:
      if (state.activities?.cultivation) {
        t.step = 1;
        log?.(STEP_TEXT[1], 'good');
      }
      break;
    case 1:
      if (state.foundation > 0) {
        t.step = 2;
        log?.(STEP_TEXT[2], 'good');
      }
      break;
    case 2:
      if (state.breakthrough?.inProgress) {
        t.step = 3;
        log?.(STEP_TEXT[3], 'good');
      }
      break;
    case 3:
      if ((state.realm?.tier ?? 0) >= 1) {
        t.completed = true;
        t.step = 4;
        log?.('Tutorial complete!', 'good');
      }
      break;
  }
}

export function resetTutorial(state) {
  state.tutorial = { step: 0, completed: false };
}
