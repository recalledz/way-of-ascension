import { on } from '../../../shared/events.js';
import { setText } from '../../../game/utils.js';
import { getKarmaPoints, getKarmaBonuses } from '../selectors.js';

function render(state){
  const bonuses = getKarmaBonuses(state);
  setText('karmaPoints', getKarmaPoints(state));
  setText('karmaAtkBonus', `${(bonuses.atk * 100).toFixed(0)}%`);
  setText('karmaDefBonus', `${(bonuses.def * 100).toFixed(0)}%`);
  setText('karmaQiRegenBonus', `${(bonuses.qiRegen * 100).toFixed(0)}%`);
}

export function mountKarmaUI(state){
  on('RENDER', () => render(state));
  render(state);
}
