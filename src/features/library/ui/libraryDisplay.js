import { STEPS } from '../../tutorial/steps.js';

export function mountLibraryUI(state) {
  updateLibraryJournal(state);
}

export function updateLibraryJournal(state) {
  const list = document.getElementById('journalEntries');
  if (!list) return;
  list.innerHTML = '';

  const t = state.tutorial || {};
  const { step = 0, completed = false } = t;

  STEPS.forEach((s, idx) => {
    if (completed || idx < step) {
      const li = document.createElement('li');
      li.textContent = `✔ ${s.req}`;
      list.appendChild(li);
    } else if (idx === step && !completed) {
      const li = document.createElement('li');
      li.textContent = `➤ ${s.req}`;
      list.appendChild(li);
    }
  });

  if (t.abilityPopupShown) {
    const li = document.createElement('li');
    li.textContent = '✔ Ability tutorial unlocked';
    list.appendChild(li);
  }
}
