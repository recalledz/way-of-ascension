/* global document */
import { getAllTunables, setTunable, resetTunables } from '../../shared/tunables.js';

// Feature flag; keep off by default.
export const ENABLE_BALANCE_TUNER = false;

export function mountBalanceTuner() {
  if (!ENABLE_BALANCE_TUNER) return;
  const panel = document.createElement('div');
  panel.id = 'balanceTuner';
  panel.style.cssText = `
    position: fixed; right: 12px; bottom: 12px; z-index: 10000;
    background: rgba(20,20,20,0.9); color: #eee; padding: 10px; border-radius: 12px;
    width: 280px; font: 12px/1.3 system-ui, sans-serif;
  `;
  panel.innerHTML = `<strong>Balance Tuner</strong>
    <div id="bt-sliders" style="max-height: 260px; overflow:auto; margin-top:8px;"></div>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button id="bt-reset">Reset</button>
      <button id="bt-close" style="margin-left:auto;">Close</button>
    </div>`;

  document.body.appendChild(panel);
  const sliders = panel.querySelector('#bt-sliders');
  const data = getAllTunables();

  for (const [key, val] of Object.entries(data)) {
    const row = document.createElement('div');
    row.style.marginBottom = '6px';
    row.innerHTML = `
      <label style="display:block; margin-bottom:2px;">${key} <span data-k="${key}" style="opacity:.8">${val.toFixed(2)}</span></label>
      <input type="range" min="0.25" max="4" step="0.01" value="${val}" data-key="${key}" />
    `;
    sliders.appendChild(row);
  }

  sliders.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.tagName !== 'INPUT') return;
    const k = el.getAttribute('data-key');
    const v = parseFloat(el.value);
    setTunable(k, v);
    const label = panel.querySelector(`span[data-k="${k}"]`);
    if (label) label.textContent = v.toFixed(2);
  });

  panel.querySelector('#bt-reset').onclick = () => {
    resetTunables();
    panel.remove();
    mountBalanceTuner();
  };
  panel.querySelector('#bt-close').onclick = () => panel.remove();
}
