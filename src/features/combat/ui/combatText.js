import { on } from '../../../shared/events.js';

export function setupCombatText() {
  on('COMBAT:CRIT', ({ amount, target }) => {
    showFloat(target, `Critical! ${amount}`, 'crit-float');
  });
  on('COMBAT:MISS', ({ target }) => {
    showFloat(target, 'Miss', 'miss-float');
  });
}

function showFloat(target, text, className) {
  const id = target === 'player' ? 'hpVal' : 'enemyHealthText';
  const el = document.getElementById(id);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const note = document.createElement('div');
  note.className = className;
  note.textContent = text;
  note.style.left = rect.left + rect.width / 2 + 'px';
  note.style.top = rect.top - 20 + 'px';
  note.style.transform = 'translateX(-50%)';
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1000);
}
