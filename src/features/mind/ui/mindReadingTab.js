// src/features/mind/ui/mindReadingTab.js

import { listManuals, getManual } from '../data/manuals.js';
import { startReading, stopReading } from '../mutators.js';
import { formatDuration } from '../../../shared/utils/time.js';

// Mapping of manual effect keys to human readable labels
const EFFECT_LABELS = {
  hpMaxPct: 'Max HP',
  physDRPct: 'Physical DR',
  accuracyPct: 'Accuracy',
  dodgePct: 'Dodge',
  attackRatePct: 'Attack Rate',
  qiCostPct: 'Qi Cost'
};

// Render an unordered list of manual effects per level
function renderEffects(manual) {
  if (!manual.effects) return '';
  const rows = manual.effects.map((eff, idx) => {
    const parts = Object.entries(eff).map(([key, val]) => {
      const label = EFFECT_LABELS[key] || key;
      const sign = val > 0 ? '+' : '';
      return `${label} ${sign}${val}%`;
    });
    return `<li>Lv ${idx + 1}: ${parts.join(', ')}</li>`;
  }).join('');
  return `<ul class="manual-effects">${rows}</ul>`;
}

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
      const maxXp = (manual.maxLevel || 1) * 100;
      const ratio = Math.min(rec.xp / maxXp, 1);
      const level = Math.floor(rec.xp / 100);
      const nextLevelXp = Math.min((level + 1) * 100, maxXp);
      const xpToNext = nextLevelXp - rec.xp;
      const xpToMax = maxXp - rec.xp;
      const timeToNext = manual.xpRate > 0 ? xpToNext / manual.xpRate : Infinity;
      const timeToMax = manual.xpRate > 0 ? xpToMax / manual.xpRate : Infinity;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>Reading: ${manual.name}</h3>
        <div>Level: ${Math.min(level, manual.maxLevel)} / ${manual.maxLevel}</div>
        <h3><iconify-icon icon="iconoir:page-flip"></iconify-icon> Reading: ${manual.name}</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${(ratio * 100).toFixed(1)}%"></div>
          <div class="progress-text">${rec.xp.toFixed(0)} / ${maxXp}</div>
        </div>
        <div>Time to next level: ${xpToNext > 0 ? formatDuration(timeToNext) : 'Done'}</div>
        <div>Time to max level: ${xpToMax > 0 ? formatDuration(timeToMax) : 'Done'}</div>
        ${renderEffects(manual)}
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
      <div><iconify-icon icon="iconoir:page-flip"></iconify-icon> <strong>${m.name}</strong></div>
      <div>${m.category}</div>
      <div>Req Level: ${m.reqLevel}</div>
      ${renderEffects(m)}
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
