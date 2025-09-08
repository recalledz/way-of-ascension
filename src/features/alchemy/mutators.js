import { S, save } from '../../shared/state.js';
import { alchemyState } from './state.js';
import { qCap, clamp } from '../progression/selectors.js';
import { applyConsumableEffect } from './consumableEffects.js';
import { ALCHEMY_RECIPES } from './data/recipes.js';

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
    const { itemKey, qty = 0, tier, type } = job.output;
    const out = alch.outputs[itemKey] || { qty: 0, tiers: {}, type };
    out.qty += qty;
    if (tier !== undefined) {
      out.tiers[tier] = (out.tiers[tier] || 0) + qty;
    }
    if (type) out.type = type;
    alch.outputs[itemKey] = out;

    if (type === 'pill') {
      state.pills ??= {};
      state.pills[itemKey] = (state.pills[itemKey] || 0) + qty;
    }
  }
  if (job.recipeKey) {
    alch.recipeStats[job.recipeKey] = (alch.recipeStats[job.recipeKey] || 0) + 1;
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
  root.pills ??= { qi: 0, body: 0, ward: 0, meridian_opening_dan: 0, insight: 0 };
  if ((root.pills[type] ?? 0) <= 0) return { ok: false, reason: 'none' };

  const recipe = ALCHEMY_RECIPES[type];
  if (!recipe) return { ok: false, reason: 'unknown' };

  if (recipe.type === 'permanent') {
    const alch = slice(root);
    const resDef = recipe.resistance || {};
    const res = alch.resistance?.[type] || { rp: 0, rpCap: resDef.rpCap };
    let { rp } = res;
    if (rp < resDef.rpCap) {
      const mult = (recipe.effect?.amount ?? 0) / (1 + rp);
      const stat = recipe.effect?.stat;
      if (stat) {
        root.stats = root.stats || {};
        root.stats[stat] = (root.stats[stat] || 0) + mult;
      }
    }
    const rpGain = resDef.baseRp * (resDef.tierWeight ?? 1);
    rp = Math.min(rp + rpGain, resDef.rpCap);
    alch.resistance[type] = { rp, rpCap: resDef.rpCap };
  } else {
    if (recipe.effect?.qiGainPct) {
      const add = Math.floor(qCap(root) * (recipe.effect.qiGainPct / 100));
      root.qi = clamp(root.qi + add, 0, qCap(root));
    }
    if (recipe.effect?.statusKey) {
      applyConsumableEffect(root, recipe.effect.statusKey, root);
    }
  }

  root.pills[type]--;
  const inv = root.alchemy?.outputs?.[type];
  if (inv) {
    inv.qty = Math.max(0, inv.qty - 1);
    if (inv.tiers && inv.tiers[tier] !== undefined) {
      inv.tiers[tier] = Math.max(0, (inv.tiers[tier] || 0) - 1);
    }
  }
  return { ok: true, type, tier };
}
