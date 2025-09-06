import { on } from '../shared/events.js';

const STEP_MESSAGES = [
  'Start cultivating to begin the tutorial.',
  'Foundation is accumulating. Keep cultivating!',
  'Try a breakthrough once you have enough foundation.',
  'Reach Stage 1 of the next realm.',
  'Tutorial complete!'
];

export function mountTutorialBox(state) {
  if (document.getElementById('tutorialBox')) return;
  const box = document.createElement('div');
  box.id = 'tutorialBox';
  box.style.position = 'fixed';
  box.style.bottom = '10px';
  box.style.left = '10px';
  box.style.padding = '8px';
  box.style.background = 'rgba(0,0,0,0.7)';
  box.style.color = '#fff';
  box.style.borderRadius = '4px';
  box.style.zIndex = '1000';
  document.body.appendChild(box);

  function render() {
    const t = state.tutorial;
    if (!t || t.completed) {
      box.style.display = 'none';
      return;
    }
    box.textContent = STEP_MESSAGES[t.step] || '';
    box.style.display = 'block';
  }

  on('RENDER', render);
  render();
}
