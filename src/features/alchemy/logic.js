import { alchemyState } from './state.js';

function slice(state){
  return state.alchemy || alchemyState;
}

export function tickAlchemy(state, stepMs = 100){
  const dt = stepMs / 1000;
  const lab = slice(state).lab;
  lab.activeJobs.forEach(job => {
    if(job.done) return;
    job.t -= dt;
    if(job.t <= 0){
      job.t = 0;
      job.done = true;
    }
  });
}
