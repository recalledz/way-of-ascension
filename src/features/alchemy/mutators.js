import { alchemyState } from './state.js';
import { qCap, clamp } from '../progression/selectors.js';

function slice(state){
  return state.alchemy || alchemyState;
}

export function startConcoct(state, job){
  const lab = slice(state).lab;
  if(lab.paused) return false;
  if(lab.activeJobs.length >= (lab.slots || 0)) return false;
  lab.activeJobs.push({ ...job });
  return true;
}

export function finishConcoct(state, jobId){
  const alch = slice(state);
  const lab = alch.lab;
  const idx = lab.activeJobs.findIndex(j => j.id === jobId);
  if(idx === -1) return false;
  const job = lab.activeJobs[idx];
  lab.activeJobs.splice(idx,1);
  const out = alch.outputs[job.output] || { qty: 0, tiers: {} };
  const qty = job.qty || 1;
  out.qty += qty;
  if(job.tier !== undefined){
    out.tiers[job.tier] = (out.tiers[job.tier] || 0) + qty;
  }
  alch.outputs[job.output] = out;
  alch.exp += job.exp || 0;
  while(alch.exp >= alch.expMax){
    alch.exp -= alch.expMax;
    alch.level++;
  }
  return true;
}

export function cancelConcoct(state, jobId){
  const lab = slice(state).lab;
  const idx = lab.activeJobs.findIndex(j => j.id === jobId);
  if(idx === -1) return false;
  lab.activeJobs.splice(idx,1);
  return true;
}

export function toggleQiDrain(state, enabled){
  slice(state).settings.qiDrainEnabled = !!enabled;
}

export function unlockRecipe(state, key){
  const known = slice(state).knownRecipes;
  known[key] = true;
}

export function usePill(root, type) {
  root.pills ??= { qi: 0, body: 0, ward: 0 };
  if ((root.pills[type] ?? 0) <= 0) return { ok: false, reason: 'none' };

  if (type === 'qi') {
    const add = Math.floor(qCap(root) * 0.25);
    root.qi = clamp(root.qi + add, 0, qCap(root));
  }
  if (type === 'body') {
    root.tempAtk = (root.tempAtk || 0) + 4;
    root.tempArmor = (root.tempArmor || 0) + 3;
  }
  if (type === 'ward') {
    // consumed during breakthrough
  }

  root.pills[type]--;
  return { ok: true, type };
}
