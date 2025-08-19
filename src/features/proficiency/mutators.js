import { proficiencyState } from './state.js';
import { gainProficiency as applyGain } from './logic.js';

export function gainProficiency(key, amount, state = proficiencyState) {
  applyGain(key, amount, state);
}
