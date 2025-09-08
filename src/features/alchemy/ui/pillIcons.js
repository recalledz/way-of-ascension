import { STATUSES } from '../../combat/data/status.js';
import { PILL_LINES } from '../data/pills.js';

export function renderPillIcons(state, containerId, pillClass) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const statuses = state.statuses || {};
  const pieces = [];
  for (const [key, inst] of Object.entries(statuses)) {
    if (!key.startsWith('pill_')) continue;
    let lineKey = null;
    for (const [pKey, meta] of Object.entries(PILL_LINES)) {
      if (meta.statusPrefix && key.startsWith(meta.statusPrefix)) {
        lineKey = pKey;
        break;
      }
    }
    if (!lineKey) continue;
    const meta = PILL_LINES[lineKey];
    if (meta.class !== pillClass) continue;
    const def = STATUSES[key];
    if (!def) continue;
    const total = def.duration || 0;
    const remaining = inst.duration || 0;
    const progress = total > 0 ? 1 - remaining / total : 0;
    const letter = meta.icon || meta.name?.[0] || '?';
    pieces.push(`<div class="pill-icon"><span class="label">${letter}</span><div class="timer-mask" style="--progress:${progress}"></div></div>`);
  }
  container.innerHTML = pieces.join('');
}
