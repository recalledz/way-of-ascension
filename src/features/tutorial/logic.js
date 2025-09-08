import { STEPS } from './steps.js';

export function tickTutorial(state) {
  const t = state.tutorial;
  if (!t || t.completed) return;
  const step = STEPS[t.step];
  if (!step) return;
  if (!t.rewardReady && step.check(state)) {
    t.rewardReady = true;
    t.showOverlay = true;
  }
}

export function resetTutorial(state) {
  state.tutorial = { step: 0, completed: false, showOverlay: true, rewardReady: false };
}

