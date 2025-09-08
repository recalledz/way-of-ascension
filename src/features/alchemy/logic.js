import { alchemyState } from './state.js';
import { finishConcoct } from './mutators.js';
import { getBuildingBonuses } from '../sect/selectors.js';
import { getTunable } from '../../shared/tunables.js';
import { addNotification } from '../../ui/notifications.js';

function slice(state) {
  return state.alchemy || alchemyState;
}

export function tickAlchemy(state, stepMs = 100) {
  const dt = stepMs / 1000;
  const alch = slice(state);
  const lab = alch.lab;
  lab.queue = lab.queue || [];

  if (lab.paused && (state.qi ?? 0) > 0) lab.paused = false;

  if (!lab.paused) {
    while (lab.activeJobs.length < lab.slots && lab.queue.length) {
      lab.activeJobs.push(lab.queue.shift());
    }
  }

  if (lab.activeJobs.length === 0) {
    if (lab.queue.length && alch.settings.qiDrainEnabled && (state.qi ?? 0) <= 0) {
      addNotification?.(state, { id: 'alchemy-no-qi', text: 'Alchemy paused: insufficient Qi' });
    }
    return;
  }

  if (alch.settings.qiDrainEnabled) {
    let coeff = 0;
    for (let i = 0; i < lab.activeJobs.length; i++) coeff += 1 + 0.25 * i;
    const base = getTunable('alchemy.qiDrainBase', 1);
    const mult =
      getTunable('alchemy.qiDrainMult', 1) *
      (alch.qiDrainMult ?? 1) *
      (getBuildingBonuses(state).alchemyQiDrainMult ?? 1);
    const drainPerSec = base * coeff * mult;
    const need = drainPerSec * dt;
    if ((state.qi ?? 0) < need) {
      lab.paused = true;
      addNotification?.(state, { id: 'alchemy-no-qi', text: 'Alchemy paused: insufficient Qi' });
      return;
    }
    state.qi -= need;
  }

  const speedMult =
    (1 + (getBuildingBonuses(state).alchemySpeed || 0)) *
    getTunable('alchemy.speedMult', 1) *
    (alch.speedMult ?? 1);

  const finished = [];
  lab.activeJobs.forEach(job => {
    if (job.remaining > 0) {
      job.remaining = Math.max(0, job.remaining - dt * speedMult);
      if (job.remaining === 0) finished.push(job.id);
    }
  });

  finished.forEach(id => finishConcoct(id, state));

  if (!lab.paused) {
    while (lab.activeJobs.length < lab.slots && lab.queue.length) {
      lab.activeJobs.push(lab.queue.shift());
    }
  }
}
