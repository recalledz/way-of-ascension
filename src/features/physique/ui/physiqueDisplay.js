import { on } from '../../../shared/events.js';
import { setText, setFill } from '../../../shared/utils/dom.js';
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
  setText('currentPhysiqueStat', state.attributes?.physique || 10);
  setText('physiqueHpStat', `+${bonuses.hpBonus}`);
  setText('physiqueCarryStat', `+${bonuses.carryCapacity}`);
  setText('physiqueMaxStaminaStat', `${bonuses.maxStamina}`);
  setText('physiqueStaminaRegenStat', `+${bonuses.staminaRegen.toFixed(2)}/s`);
  setText('physiqueStaminaDrainStat', `-${bonuses.staminaDrain}/s`);
}

export function mountPhysiqueUI(state){
  on('RENDER', () => render(state));
  render(state);
}
