import { S } from '../../../shared/state.js';
import { COMBO_WINDOW_MS } from '../logic.js';

const IDS = {
  container: 'comboDisplay',
  count: 'comboCountValue',
  timerText: 'comboTimerText',
  timerFill: 'comboTimerFill',
};

function ensureComboDisplay() {
  if (typeof document === 'undefined') return null;
  let container = document.getElementById(IDS.container);
  if (container) return container;

  const battleArea = document.getElementById('battleArea');
  if (!battleArea) return null;

  container = document.createElement('div');
  container.id = IDS.container;
  container.className = 'combo-display inactive';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  container.innerHTML = `
    <div class="combo-header">
      <span class="combo-label" data-role="combo-label">Combo</span>
      <span class="combo-count" id="${IDS.count}">—</span>
    </div>
    <div class="combo-bar" aria-hidden="true">
      <div class="combo-fill" id="${IDS.timerFill}"></div>
    </div>
    <div class="combo-timer-text" id="${IDS.timerText}">Ready</div>
  `;

  const hud = battleArea.querySelector('.combat-hud');
  if (hud && hud.nextSibling) {
    battleArea.insertBefore(container, hud.nextSibling);
  } else {
    battleArea.appendChild(container);
  }

  return container;
}

export function mountComboDisplay() {
  return ensureComboDisplay();
}

export function updateComboDisplay(state = S) {
  const combo = state?.combat;
  const container = ensureComboDisplay();
  if (!container || !combo) return;

  const countEl = container.querySelector(`#${IDS.count}`);
  const timerTextEl = container.querySelector(`#${IDS.timerText}`);
  const fillEl = container.querySelector(`#${IDS.timerFill}`);

  const count = combo.comboCount || 0;
  const timeout = Math.max(0, combo.comboTimeoutMs || 0);
  const windowMs = Math.max(COMBO_WINDOW_MS, 1);
  const ratio = Math.min(1, timeout / windowMs);

  if (countEl) countEl.textContent = count > 0 ? `x${count}` : '—';
  if (timerTextEl) {
    timerTextEl.textContent = count > 0 ? `${(timeout / 1000).toFixed(2)}s` : 'Ready';
  }
  if (fillEl) fillEl.style.width = `${Math.round(ratio * 100)}%`;

  container.classList.toggle('active', count > 0);
  container.classList.toggle('inactive', count <= 0);
  container.title =
    count > 0
      ? `Combo ${count} — ${(timeout / 1000).toFixed(2)}s remaining`
      : 'Build combo by landing consecutive hits.';
}

