import { on } from '../../shared/events.js';

export function setupAbilityUI() {
  on('ABILITY:HEAL', ({ amount }) => {
    showHeal(amount);
  });
}

function showHeal(amount) {
  const el = document.getElementById('hpVal');
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const note = document.createElement('div');
  note.className = 'heal-float';
  note.textContent = `+${amount}`;
  note.style.left = rect.left + 'px';
  note.style.top = rect.top - 20 + 'px';
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1000);
}
