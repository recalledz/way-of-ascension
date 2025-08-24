import { clamp } from '../../features/progression/selectors.js';

export const qs = sel => document.querySelector(sel);

export function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

export function setFill(id, ratio) {
  ratio = clamp(ratio, 0, 1);
  const el = document.getElementById(id);
  if (!el) return;
  const pct = (ratio * 100).toFixed(1) + '%';
  if (el instanceof SVGElement) el.setAttribute('width', pct);
  else el.style.width = pct;
}

export function log(msg, cls = '') {
  const el = document.getElementById('log');
  if (!el) return;
  const p = document.createElement('p');
  if (cls) p.className = cls;
  p.textContent = msg;
  el.appendChild(p);
  el.scrollTop = el.scrollHeight;
}
