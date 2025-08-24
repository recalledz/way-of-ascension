// src/features/mind/ui/mindReadingTab.js

import { listManuals, getManual } from '../data/manuals.js';
import { stopReading } from '../mutators.js';
import { calcManualSpeedDetails } from '../logic.js';
import { emit, on } from '../../../shared/events.js';

// Mapping of manual effect keys to human readable labels
const EFFECT_LABELS = {
  hpMaxPct: 'Max HP',
  physDRPct: 'Physical DR',
  accuracyPct: 'Accuracy',
  dodgePct: 'Dodge',
  attackRatePct: 'Attack Rate',
  qiCostPct: 'Qi Cost'
};

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderSpeedInfo(manual, stats) {
  const info = calcManualSpeedDetails(manual, stats);
  const total = ((info.mult - 1) * 100).toFixed(0);
  const parts = Object.keys(manual.statWeights || {}).map(stat => {
    const pct = (info.contributions[stat] || 0) * 100;
    const sign = pct >= 0 ? '+' : '';
    return `${cap(stat)} ${sign}${pct.toFixed(0)}%`;
  }).join(', ');
  return `<div>Reading Speed: ${total >= 0 ? '+' : ''}${total}% (${parts})</div>`;
}

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

function formatTime(sec) {
  if (!isFinite(sec) || sec === Infinity) return '∞';
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
  }
  return `${m}:${r.toString().padStart(2, '0')}`;
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
      const rec = S.mind.manualProgress[activeId] || { xp: 0, level: 0 };
      const speedInfo = calcManualSpeedDetails(manual, S.stats);
      const speed = speedInfo.mult;
      const xpRate = manual.xpRate * speed;
      const needed = manual.baseTimeSec * manual.levelTimeMult[rec.level] * manual.xpRate;
      const ratio = Math.min(rec.xp / needed, 1);
      const timeToNext = (needed - rec.xp) / xpRate;
      let timeToMax = timeToNext;
      for (let lvl = rec.level + 1; lvl < manual.maxLevel; lvl++) {
        timeToMax += manual.baseTimeSec * manual.levelTimeMult[lvl] / speed;
      }
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3><iconify-icon icon="iconoir:page-flip"></iconify-icon> Reading: ${manual.name} (Lv ${rec.level}/${manual.maxLevel})</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${(ratio * 100).toFixed(1)}%"></div>
          <div class="progress-text">${rec.xp.toFixed(1)} / ${needed.toFixed(1)}</div>
        </div>
        <div class="timers">
          <div>Next Level: ${formatTime(timeToNext)}</div>
          <div>Max Level: ${formatTime(timeToMax)}</div>
        </div>
        ${renderSpeedInfo(manual, S.stats)}
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
      ${renderSpeedInfo(m, S.stats)}
      ${renderEffects(m)}
    `;
    const btn = document.createElement('button');
    btn.className = 'btn small';
    btn.textContent = 'Start';
    const progress = S.mind.manualProgress[m.id];
    const maxed = progress?.level >= m.maxLevel;
    btn.disabled = S.mind.level < m.reqLevel || maxed;
    btn.addEventListener('click', () => {
      emit('mind/manuals/startReading', { root: S, manualId: m.id });
      renderMindReadingTab(rootEl, S);
    });
    item.appendChild(btn);
    list.appendChild(item);
  }
  rootEl.appendChild(list);
}

export function mountMindReadingUI(state) {
  on('RENDER', () => {
    const el = document.getElementById('mindReadingTab');
    if (el?.classList.contains('active')) {
      renderMindReadingTab(el, state);
    }
  });
}

export default renderMindReadingTab;
