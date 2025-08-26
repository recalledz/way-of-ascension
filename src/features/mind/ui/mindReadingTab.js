// Redesigned Manuals tab with queue bar and collapsible manual cards

import { listManuals, getManual } from '../data/manuals.js';
import { calcManualSpeedDetails } from '../logic.js';
import { emit, on } from '../../../shared/events.js';

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
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${r}s`;
}

function levelDots(current, max) {
  let html = '';
  for (let i = 0; i < max; i++) {
    html += `<span class="dot ${i < current ? 'filled' : ''}"></span>`;
  }
  return html;
}

function showManualPopup(manual, S) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content card">
      <div class="card-header">
        <h4>${manual.name}</h4>
        <button class="btn small ghost close-btn">×</button>
      </div>
      <div class="manual-meta">${manual.category} • Req Level ${manual.reqLevel}</div>
      ${renderSpeedInfo(manual, S.stats)}
      ${renderEffects(manual)}
      <div class="manual-actions">
        <button class="btn small add-btn">Add to Queue</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('.close-btn').addEventListener('click', close);
  overlay.querySelector('.modal-backdrop').addEventListener('click', close);
  overlay.querySelector('.add-btn').addEventListener('click', e => {
    e.stopPropagation();
    emit('mind/manuals/startReading', { root: S, manualId: manual.id });
    close();
  });
}

function createManualCard(manual, S) {
  const rec = S.mind.manualProgress[manual.id] || { xp: 0, level: 0 };
  const level = rec.level;
  const maxed = level >= manual.maxLevel;
  const needed = manual.baseTimeSec * manual.levelTimeMult[level] * manual.xpRate;
  const ratio = maxed ? 1 : Math.min(rec.xp / needed, 1);

  const card = document.createElement('button');
  card.className = 'manual-card';
  card.id = `manual-${manual.id}`;
  card.innerHTML = `
    <div class="manual-card-header">
      <iconify-icon icon="iconoir:book" aria-hidden="true"></iconify-icon>
      <span class="name">${manual.name}</span>
    </div>
    <div class="manual-card-level">
      <span class="level-dots">${levelDots(level, manual.maxLevel)}</span>
      <span class="progress-pill"><div style="width:${(ratio * 100).toFixed(1)}%"></div></span>
    </div>`;
  card.addEventListener('click', () => showManualPopup(manual, S));

  return card;
}

function buildQueueItems(S) {
  const items = [];
  const id = S.mind.activeManualId;
  if (id) {
    const m = getManual(id);
    if (m) {
      const rec = S.mind.manualProgress[id] || { xp: 0, level: 0 };
      const speed = calcManualSpeedDetails(m, S.stats).mult;
      const needed = m.baseTimeSec * m.levelTimeMult[rec.level] * m.xpRate;
      const xpRate = m.xpRate * speed;
      const eta = (needed - rec.xp) / xpRate;
      items.push({
        manualKey: id,
        fromLevel: rec.level,
        toLevel: rec.level + 1,
        etaText: formatTime(eta),
        name: m.name,
      });
    }
  }
  return items;
}

function renderQueueBar(items, focusFn) {
  const bar = document.createElement('div');
  bar.className = 'queue-bar';

  const chipWrap = document.createElement('div');
  chipWrap.className = 'queue-chips';
  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = 'No manuals in queue';
    chipWrap.appendChild(empty);
  } else {
    for (const it of items) {
      const chip = document.createElement('button');
      chip.className = 'queue-chip';
      chip.innerHTML = `<iconify-icon icon="iconoir:book" aria-hidden="true"></iconify-icon> ${it.name} — Lv ${it.fromLevel}→${it.toLevel} • ${it.etaText}`;
      chip.setAttribute('aria-label', `${it.name}, level ${it.fromLevel} to ${it.toLevel}, ${it.etaText}`);
      chip.addEventListener('click', () => focusFn(it.manualKey));
      chipWrap.appendChild(chip);
    }
  }

  const manageBtn = document.createElement('button');
  manageBtn.className = 'btn small manage-queue';
  manageBtn.textContent = 'Manage Queue';
  manageBtn.addEventListener('click', () => {
    alert('Queue manager coming soon');
  });

  bar.appendChild(chipWrap);
  bar.appendChild(manageBtn);
  return bar;
}

export function renderMindReadingTab(rootEl, S) {
  if (!rootEl) return;
  rootEl.innerHTML = '';

  const manualMap = new Map();

  function focusManual(id) {
    const manual = manualMap.get(id);
    if (manual) {
      showManualPopup(manual, S);
    }
  }

  const queueItems = buildQueueItems(S);
  rootEl.appendChild(renderQueueBar(queueItems, focusManual));

  const list = document.createElement('div');
  list.className = 'manuals-list';

  for (const m of listManuals()) {
    const card = createManualCard(m, S);
    list.appendChild(card);
    manualMap.set(m.id, m);
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

