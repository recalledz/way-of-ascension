import { getProficiency } from '../logic.js';

export function validate() {
  const errors = [];
  const samples = [0, 10, 50, 100, 250, 500, 1000];

  let last = -Infinity;
  const state = { proficiency: {} };
  for (const p of samples) {
    state.proficiency.test = p;
    const { bonus } = getProficiency('test', state);
    if (!(bonus >= 0 && bonus <= 3)) {
      errors.push(`proficiency bonus(${p})=${bonus} out of [0,3]`);
    }
    if (bonus < last) errors.push(`proficiency bonus not monotonic at ${p}`);
    last = bonus;
  }
  return { ok: errors.length === 0, errors };
}
