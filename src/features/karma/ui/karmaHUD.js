import { S } from '../../../shared/state.js';
import { calcKarmaGain } from '../selectors.js';

export function updateKarmaDisplay(state = S) {
  const ascendBtn = document.getElementById('ascendBtn');
  if (ascendBtn) ascendBtn.disabled = calcKarmaGain(state) <= 0;
}
