// src/features/mind/ui/mindStatsTab.js

import { listManuals } from '../data/manuals.js';

// Mapping of manual effect keys to human readable labels
const EFFECT_LABELS = {
  hpMaxPct: 'Max HP',
  physDRPct: 'Physical DR',
  accuracyPct: 'Accuracy',
  dodgePct: 'Dodge',
  attackRatePct: 'Attack Rate',
  qiCostPct: 'Qi Cost',
};

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Render the Mind Stats tab UI showing bonuses from manuals.
 * @param {HTMLElement} rootEl container element
 * @param {object} S game state
 */
export function renderMindStatsTab(rootEl, S) {
  if (!rootEl) return;
  rootEl.innerHTML = '';

  let totalLevels = 0;
  const totals = {};
  for (const m of listManuals()) {
    const progress = S.mind.manualProgress[m.id];
    const lvl = progress?.level || 0;
    totalLevels += lvl;
    for (let i = 0; i < lvl; i++) {
      const eff = m.effects?.[i];
      if (!eff) continue;
      for (const [k, v] of Object.entries(eff)) {
        totals[k] = (totals[k] || 0) + v;
      }
    }
  }

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h3>Manual Bonuses</h3>
    <div class="stat"><span>Total Manual Levels</span><span>${totalLevels}</span></div>`;

  if (Object.keys(totals).length) {
    const list = document.createElement('ul');
    list.className = 'manual-effects';
    for (const [key, val] of Object.entries(totals)) {
      const label = EFFECT_LABELS[key] || cap(key);
      const sign = val > 0 ? '+' : '';
      const li = document.createElement('li');
      li.textContent = `${label} ${sign}${val}%`;
      list.appendChild(li);
    }
    card.appendChild(list);
  } else {
    const none = document.createElement('div');
    none.className = 'muted';
    none.textContent = 'No manual bonuses yet';
    card.appendChild(none);
  }

  rootEl.appendChild(card);
}

export default renderMindStatsTab;
