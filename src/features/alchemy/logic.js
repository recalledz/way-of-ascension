import { alchemyState } from './state.js';

function slice(state) {
  return state.alchemy || alchemyState;
}

export function tickAlchemy(state, stepMs = 100) {
  const dt = stepMs / 1000;
  const alch = slice(state);
  const lab = alch.lab;
  if (lab.paused) return;
  lab.activeJobs.forEach(job => {
    if (job.remaining > 0) {
      job.remaining = Math.max(0, job.remaining - dt);
      if (job.remaining === 0) job.done = true;
    }
  });
}
