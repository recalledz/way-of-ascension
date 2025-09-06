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
import { initializeFight } from '../combat/mutators.js';
import { adventureState } from './state.js';
import { log } from '../../shared/utils/dom.js';
import { stopActivity as stopActivityMut } from '../activity/mutators.js';

export {
  selectZone,
  selectArea,
  selectAreaById,
  startAdventureCombat,
  startBossCombat,
  progressToNextArea,
  instakillCurrentEnemy
};

export function startAdventure(state = S) {
  if (!state.adventure) {
    const { enemyHP, enemyMax } = initializeFight({ hp: 0 }, state);
    state.adventure = {
      ...structuredClone(adventureState),
      playerHP: state.hp,
      enemyHP,
      enemyMaxHP: enemyMax,
      lastPlayerAttack: 0,
      lastEnemyAttack: 0,
      playerStunBar: 0,
      enemyStunBar: 0,
    };
  }
  return state.adventure;
}

export function retreatFromCombat(state = S) {
  if (state.adventure?.isBossFight) {
    log('Retreat is impossible during a boss fight.', 'bad');
    return;
  }
  baseRetreatFromCombat();
  const loss = Math.floor(qCap(state) * 0.25);
  state.qi = Math.max(0, state.qi - loss);
  stopActivityMut(state, 'adventure');
  log(`Retreated from combat. Lost ${loss} Qi.`, 'neutral');
}

/**
 * Reset the player's Qi to zero when retreating due to defeat.
 * Used when a retreat countdown ends because the player was killed mid-retreat.
 *
 * @param {object} state - The game state (defaults to shared state S).
 */
export function resetQiOnRetreat(state = S) {
  state.qi = 0;
}
