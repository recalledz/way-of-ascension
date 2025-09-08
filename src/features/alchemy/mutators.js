import { S, save } from '../../shared/state.js';
import { alchemyState } from './state.js';
import { qCap, clamp } from '../progression/selectors.js';
import { applyConsumableEffect } from './consumableEffects.js';

function slice(state = S) {
  state.alchemy = state.alchemy || structuredClone(alchemyState);
  return state.alchemy;
}

export function startConcoct(job, state = S) {
  const lab = slice(state).lab;
  if (lab.activeJobs.length >= lab.slots) return false;
  const id = job.id || Date.now() + Math.random();
  const total = job.time ?? job.duration ?? 0;
  lab.activeJobs.push({ ...job, id, time: total, remaining: job.remaining ?? total });
  save?.();
  return id;
}

export function finishConcoct(jobId, state = S) {
  const alch = slice(state);
  const lab = alch.lab;
  const idx = lab.activeJobs.findIndex(j => j.id === jobId);
  if (idx === -1) return false;
  const [job] = lab.activeJobs.splice(idx, 1);
  if (job.output) {
    const { itemKey, qty = 0, tier } = job.output;
    const out = alch.outputs[itemKey] || { qty: 0, tiers: {} };
    out.qty += qty;
    if (tier !== undefined) {
      out.tiers[tier] = (out.tiers[tier] || 0) + qty;
    }
    alch.outputs[itemKey] = out;
  }
  alch.exp += job.exp || 0;
  while (alch.exp >= alch.expMax) {
    alch.exp -= alch.expMax;
    alch.level += 1;
    alch.expMax = Math.round(alch.expMax * 1.5);
  }
  save?.();
  return true;
}

export function cancelConcoct(jobId, state = S) {
  const lab = slice(state).lab;
  const idx = lab.activeJobs.findIndex(j => j.id === jobId);
  if (idx === -1) return false;
  lab.activeJobs.splice(idx, 1);
  save?.();
  return true;
}

export function toggleQiDrain(enabled, state = S) {
  const alch = slice(state);
  alch.settings.qiDrainEnabled = !!enabled;
  save?.();
  return alch.settings.qiDrainEnabled;
}

export function usePill(root, type, tier = 1) {
  root.pills ??= { qi: 0, body: 0, ward: 0 };
  if ((root.pills[type] ?? 0) <= 0) return { ok: false, reason: 'none' };

  if (type === 'qi') {
    const add = Math.floor(qCap(root) * 0.25);
    root.qi = clamp(root.qi + add, 0, qCap(root));
  }
  if (type === 'body') {
    applyConsumableEffect(root, `pill_body_t${tier}`, root);
  }
  if (type === 'ward') {
    applyConsumableEffect(root, `pill_breakthrough_t${tier}`, root);
  }

  root.pills[type]--;
  return { ok: true, type, tier };
}
