import { on } from '../../../shared/events.js';
import { setText, setFill } from '../../../game/utils.js';
import {
  getPhysiqueLevel,
  getPhysiqueExp,
  getPhysiqueExpMax,
  getPhysiqueBonuses,
} from '../selectors.js';

function render(state){
  setText('physiqueLevel', `Level ${getPhysiqueLevel(state)}`);
  setFill('physiqueProgressFill', getPhysiqueExp(state) / getPhysiqueExpMax(state));
  const bonuses = getPhysiqueBonuses(state);
  setText('physiqueHpStat', `+${bonuses.hpBonus}`);
  setText('physiqueCarryStat', `+${bonuses.carryCapacity}`);
}

export function mountPhysiqueUI(state){
  on('RENDER', () => render(state));
  render(state);
}
