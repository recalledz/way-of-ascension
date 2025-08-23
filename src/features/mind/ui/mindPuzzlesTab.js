// src/features/mind/ui/mindPuzzlesTab.js

import { solvePuzzle } from '../mutators.js';
import { save } from '../../../shared/state.js';

/**
 * Render the Mind Puzzles tab UI.
 * @param {HTMLElement} rootEl container element
 * @param {object} S game state
 */
export function renderMindPuzzlesTab(rootEl, S) {
  if (!rootEl) return;
  rootEl.innerHTML = '';

  const multCard = document.createElement('div');
  multCard.className = 'card';
  multCard.innerHTML = `
    <h3>Puzzles</h3>
    <div class="stat"><span>Permanent Multiplier</span><span id="mindPuzzleMult">x${S.mind.multiplier.toFixed(2)}</span></div>
    <div class="stat"><span>Solved</span><span id="mindPuzzleSolved">${S.mind.solvedPuzzles}</span></div>
  `;
  rootEl.appendChild(multCard);

  const nextCard = document.createElement('div');
  nextCard.className = 'card';
  nextCard.innerHTML = '<h4>Next Puzzle</h4>';

  const diffSelect = document.createElement('select');
  diffSelect.className = 'btn';
  for (let i = 0; i < 5; i += 1) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `Difficulty ${i + 1}`;
    diffSelect.appendChild(opt);
  }

  const solveBtn = document.createElement('button');
  solveBtn.className = 'btn primary';
  solveBtn.textContent = 'Solve';

  solveBtn.addEventListener('click', () => {
    const idx = parseInt(diffSelect.value, 10) || 0;
    solvePuzzle(S, idx);
    save?.();
    renderMindPuzzlesTab(rootEl, S);
  });

  const row = document.createElement('div');
  row.className = 'row';
  row.appendChild(diffSelect);
  row.appendChild(solveBtn);

  nextCard.appendChild(row);
  rootEl.appendChild(nextCard);
}

export default renderMindPuzzlesTab;

