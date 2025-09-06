import { on } from '../shared/events.js';

const messages = [
  'Select cultivation to begin meditating.',
  'Foundation is rising. Fill it completely.',
  'Click the breakthrough button.',
  'Tutorial complete!'
];

export function mountTutorialBox(state) {
  const box = document.createElement('div');
  box.id = 'tutorialBox';
  Object.assign(box.style, {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    borderRadius: '4px',
    maxWidth: '280px',
    zIndex: 1000,
    fontSize: '14px'
  });
  document.body.appendChild(box);

  const render = () => {
    const t = state.tutorial;
    if (!t || t.completed) {
      box.style.display = 'none';
      return;
    }
    box.style.display = 'block';
    box.textContent = messages[t.step] || '';
  };
  render();
  on('RENDER', render);
}
