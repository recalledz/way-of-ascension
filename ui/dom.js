import { clamp } from '../src/game/engine.js';

export const qs = sel => document.querySelector(sel);

export function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

export function setFill(id, ratio) {
  ratio = clamp(ratio, 0, 1);
  const el = document.getElementById(id);
  if (el) el.style.width = (ratio * 100).toFixed(1) + '%';
}
