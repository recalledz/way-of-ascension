import { alchemyState } from './state.js';

function slice(state){
  return state.alchemy || alchemyState;
}

export function tickAlchemy(state, stepMs = 100){
  const dt = stepMs / 1000;
  const alch = slice(state);
  alch.labTimer = (alch.labTimer || 0) + dt;
  alch.queue.forEach(q => {
    if(!q.done){
      q.t -= dt;
      if(q.t <= 0){
        q.t = 0;
        q.done = true;
      }
    }
  });
}
