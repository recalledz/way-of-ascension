// src/features/mind/ui/mindReadingTab.js

import { listManuals, getManual } from '../data/manuals.js';
import { startReading, stopReading } from '../mutators.js';

/**
 * Render the Mind Reading tab UI.
 * @param {HTMLElement} rootEl container element
 * @param {object} S game state
 */
export function renderMindReadingTab(rootEl, S) {
  if (!rootEl) return;
  rootEl.innerHTML = '';

  const activeId = S.mind.activeManualId;
  if (activeId) {
    const manual = getManual(activeId);
    if (manual) {
      const rec = S.mind.manualProgress[activeId] || { xp: 0 };
      const max = manual.reqLevel * 100;
      const ratio = Math.min(rec.xp / max, 1);
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>Reading: ${manual.name}</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${(ratio * 100).toFixed(1)}%"></div>
          <div class="progress-text">${rec.xp.toFixed(0)} / ${max}</div>
        </div>
      `;
      const stopBtn = document.createElement('button');
      stopBtn.className = 'btn small';
      stopBtn.textContent = 'Stop';
      stopBtn.addEventListener('click', () => {
        stopReading(S);
        renderMindReadingTab(rootEl, S);
      });
      card.appendChild(stopBtn);
      rootEl.appendChild(card);
    }
  }

  const list = document.createElement('div');
  list.className = 'cards';
  for (const m of listManuals()) {
    const item = document.createElement('div');
    item.className = 'card';
    item.innerHTML = `
      <div><strong>${m.name}</strong></div>
      <div>${m.category}</div>
      <div>Req Level: ${m.reqLevel}</div>
    `;
    const btn = document.createElement('button');
    btn.className = 'btn small';
    btn.textContent = 'Start';
    btn.disabled = S.mind.level < m.reqLevel;
    btn.addEventListener('click', () => {
      startReading(S, m.id);
      renderMindReadingTab(rootEl, S);
    });
    item.appendChild(btn);
    list.appendChild(item);
  }
  rootEl.appendChild(list);
}

export default renderMindReadingTab;
