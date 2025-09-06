import { fCap, realmStage } from '../progression/selectors.js';

export function tickTutorial(state) {
  const t = state.tutorial;
  if (!t || t.completed) return;
  if (t.step === 0) {
    if (!t.rewardReady && state.foundation >= fCap(state) * 0.99) {
      t.rewardReady = true;
      t.showOverlay = true;
    }
  } else if (t.step === 1) {
    if (!t.rewardReady && realmStage(state) >= 2) {
      t.rewardReady = true;
      t.showOverlay = true;
    }
  }
}

export function resetTutorial(state) {
  state.tutorial = { step: 0, completed: false, showOverlay: true, rewardReady: false };
}

