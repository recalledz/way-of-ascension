import {
  selectZone,
  selectArea,
  selectAreaById,
  startAdventureCombat,
  startBossCombat,
  progressToNextArea,
  instakillCurrentEnemy,
  retreatFromCombat as baseRetreatFromCombat
} from './logic.js';
import { qCap } from '../progression/selectors.js';
import { S } from '../../shared/state.js';
import { log } from '../../shared/utils/dom.js';

export {
  selectZone,
  selectArea,
  selectAreaById,
  startAdventureCombat,
  startBossCombat,
  progressToNextArea,
  instakillCurrentEnemy
};

export function retreatFromCombat(state = S) {
  baseRetreatFromCombat();
  const loss = Math.floor(qCap(state) * 0.25);
  state.qi = Math.max(0, state.qi - loss);
  if (typeof globalThis.stopActivity === 'function') {
    globalThis.stopActivity('adventure');
  } else if (state.activities) {
    state.activities.adventure = false;
  }
  log(`Retreated from combat. Lost ${loss} Qi.`, 'neutral');
}
