import { S } from '../../game/state.js';
import { on } from '../../shared/events.js';
import { getAlchemyQueue, getBrewSuccessChance } from './selectors.js';

export const calculateBrewSuccess = (recipe, state = S) =>
  getBrewSuccessChance(recipe, state);

export function processQueue(stepMs, state = S) {
  const dt = stepMs / 1000;
  const queue = getAlchemyQueue(state);
  queue.forEach(q => {
    if (!q.done) {
      q.t -= dt;
      if (q.t <= 0) {
        q.t = 0;
        q.done = true;
      }
    }
  });
}

export function tickAlchemy(event, state = S) {
  const step = event?.stepMs || 0;
  processQueue(step, state);
}

on('TICK', e => tickAlchemy(e, S));
