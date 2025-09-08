import { alchemyState } from './state.js';
import { getAlchemySpeedBonus, getQiDrainMultiplier, getLabSlots } from './selectors.js';
import { addNotification, dismissNotification } from '../../ui/notifications.js';
import { finishConcoct } from './mutators.js';

function slice(state) {
  return state.alchemy || alchemyState;
}

export function tickAlchemy(state, stepMs = 100) {
  const dt = stepMs / 1000;
  const alch = slice(state);
  const lab = alch.lab;
  lab.queue ||= [];
  lab.baseSlots ??= lab.slots ?? 0;
  lab.slots = getLabSlots(state);
  // Fill available slots from queue
  while (lab.activeJobs.length < lab.slots && lab.queue.length > 0) {
    lab.activeJobs.push(lab.queue.shift());
  }

  const speedMult = 1 + getAlchemySpeedBonus(state);
  const baseDrain = 1; // base qi drain per slot per second
  const drainMult = getQiDrainMultiplier(state);

  const slotFactor = lab.activeJobs.reduce((sum, _j, idx) => sum + (1 + 0.25 * idx), 0);
  const drainPerSec = baseDrain * slotFactor * drainMult;
  const drainCost = drainPerSec * dt;

  if (alch.settings.qiDrainEnabled) {
    if (lab.paused) {
      if (state.qi >= drainCost) {
        lab.paused = false;
        dismissNotification(state, 'alchemy-no-qi');
      } else {
        addNotification(state, { id: 'alchemy-no-qi', text: 'Alchemy paused: insufficient Qi.' });
        return;
      }
    }
    if (!lab.paused) {
      if (state.qi < drainCost) {
        lab.paused = true;
        addNotification(state, { id: 'alchemy-no-qi', text: 'Alchemy paused: insufficient Qi.' });
        return;
      }
      state.qi -= drainCost;
      dismissNotification(state, 'alchemy-no-qi');
    }
  } else {
    lab.paused = false;
    dismissNotification(state, 'alchemy-no-qi');
  }

  if (lab.paused) return;

  lab.activeJobs.forEach(job => {
    if (job.remaining > 0) {
      job.remaining = Math.max(0, job.remaining - dt * speedMult);
      if (job.remaining === 0) job.done = true;
    }
  });

  // Finish completed jobs and free slots
  for (const job of [...lab.activeJobs]) {
    if (job.done) finishConcoct(job.id, state);
  }
}
