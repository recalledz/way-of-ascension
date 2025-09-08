import { S, save } from '../../shared/state.js';
import { alchemyState } from './state.js';
import { getSuccessBonus } from './selectors.js';
import { qCap, clamp } from '../progression/selectors.js';
import { applyConsumableEffect } from './consumableEffects.js';
import { ALCHEMY_RECIPES } from './data/recipes.js';

function slice(state = S) {
  state.alchemy = state.alchemy || structuredClone(alchemyState);
  return state.alchemy;
}

export function unlockRecipe(recipeKey, state = S) {
  const alch = slice(state);
  alch.knownRecipes = alch.knownRecipes || {};
  alch.knownRecipes[recipeKey] = true;
  save?.();
}

export function startConcoct(job, state = S) {
  const lab = slice(state).lab;
  const id = job.id || Date.now() + Math.random();
  const total = job.time ?? job.duration ?? 0;
  const fullJob = { ...job, id, time: total, remaining: job.remaining ?? total };
  if (lab.activeJobs.length < lab.slots) lab.activeJobs.push(fullJob);
  else {
    lab.queue = lab.queue || [];
    lab.queue.push(fullJob);
  }
  save?.();
  return id;
}

export function finishConcoct(jobId, state = S) {
  const alch = slice(state);
  const lab = alch.lab;
  const idx = lab.activeJobs.findIndex(j => j.id === jobId);
  if (idx === -1) return false;
  const [job] = lab.activeJobs.splice(idx, 1);
  const successChance = Math.min(1, 0.8 + getSuccessBonus(state));
  const succeeded = Math.random() < successChance;
  if (succeeded && job.output) {
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
    alch.recipeStats = alch.recipeStats || {};
    const stats = alch.recipeStats[job.recipeKey] || { crafted: 0 };
    stats.crafted += 1;
    alch.recipeStats[job.recipeKey] = stats;
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
  let idx = lab.activeJobs.findIndex(j => j.id === jobId);
  if (idx !== -1) {
    lab.activeJobs.splice(idx, 1);
  } else {
    idx = lab.queue.findIndex(j => j.id === jobId);
    if (idx === -1) return false;
    lab.queue.splice(idx, 1);
  }
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

  if (recipe?.type === 'permanent') {
    const resDef = recipe.resistance || { rpCap: 0, baseRp: 0, tierWeight: 1 };
    const alch = slice(root);
    const res = alch.resistance?.[type] || { rp: 0, rpCap: resDef.rpCap };
    let { rp } = res;
    if (rp < resDef.rpCap) {
      const stats = recipe.effects?.stats || {};
      root.stats = root.stats || {};
      for (const [stat, val] of Object.entries(stats)) {
        const gain = val / (1 + rp);
        root.stats[stat] = (root.stats[stat] || 0) + gain;
      }
    }
    const rpGain = resDef.baseRp * (resDef.tierWeight ?? 1);
    rp = Math.min(rp + rpGain, resDef.rpCap);
    alch.resistance[type] = { rp, rpCap: resDef.rpCap };
  } else {
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
    if (type === 'meridian_opening_dan') {
      applyConsumableEffect(root, 'pill_meridian_opening_t1', root);
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
