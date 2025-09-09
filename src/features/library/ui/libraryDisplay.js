import { STEPS } from '../../tutorial/steps.js';
import { emit } from '../../../shared/events.js';

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
    if (!completed && idx > step) return;

    const li = document.createElement('li');
    const mark = document.createElement('span');
    mark.className = 'checkmark';
    mark.textContent = '✔';

    const text = document.createElement('span');
    text.textContent = s.req;

    li.append(mark, text);
    li.addEventListener('click', () => emit('OPEN_TUTORIAL'));

    if (completed || idx < step) {
      li.classList.add('completed');
    } else {
      li.classList.add('current');
    }

    list.appendChild(li);
  });

  if (t.abilityPopupShown) {
    const li = document.createElement('li');
    const mark = document.createElement('span');
    mark.className = 'checkmark';
    mark.textContent = '✔';
    const text = document.createElement('span');
    text.textContent = 'Ability tutorial unlocked';
    li.append(mark, text);
    li.classList.add('completed');
    li.addEventListener('click', () => emit('OPEN_TUTORIAL'));
    list.appendChild(li);
  }
}
