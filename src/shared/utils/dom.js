export const qs = sel => document.querySelector(sel);

export function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

export function setFill(id, ratio) {
  const el = document.getElementById(id);
  if (!el) return;
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  el.style.width = pct.toFixed(1) + '%';
}
