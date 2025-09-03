import { S } from '../../shared/state.js';
import { log } from '../../shared/utils/dom.js';

export function getGatheringRate(state = S) {
  const baseRate = 3;
  const levelBonus = state.gathering?.level ? state.gathering.level * 0.1 : 0;
  return baseRate * (1 + levelBonus);
}

export function advanceGathering(state = S) {
  if (!state.activities?.gathering) return;
  const rate = getGatheringRate(state);
  state.wood = (state.wood || 0) + rate;
  if (Math.random() < 0.05) {
    state.spiritWood = (state.spiritWood || 0) + 1;
    log?.('Found Spirit Wood!', 'good');
  }
  state.gathering.resourcesGained = (state.gathering.resourcesGained || 0) + rate;
  const expGain = 0.5;
  state.gathering.exp += expGain;
  if (state.gathering.exp >= state.gathering.expMax) {
    state.gathering.level++;
    state.gathering.exp = 0;
    state.gathering.expMax = Math.floor(state.gathering.expMax * 1.3);
    log?.(`Gathering level up! Level ${state.gathering.level}`, 'good');
  }
}
