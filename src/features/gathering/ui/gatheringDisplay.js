import { S } from '../../../shared/state.js';
import { setText } from '../../../shared/utils/dom.js';
import { on } from '../../../shared/events.js';
import { getGatheringRate } from '../logic.js';

export function updateActivityGathering(state = S) {
  if (!state.gathering) return;
  setText('gatheringLevelActivity', state.gathering.level);
  setText('gatheringExpActivity', Math.floor(state.gathering.exp));
  setText('gatheringExpMaxActivity', state.gathering.expMax);

  const current = state.activities.gathering ? 'Wood' : 'Nothing';
  setText('currentlyGathering', current);

  const fill = document.getElementById('gatheringFillActivity');
  if (fill) {
    fill.style.width = (state.gathering.exp / state.gathering.expMax * 100) + '%';
  }

  const startBtn = document.getElementById('startGatheringActivity');
  if (startBtn) {
    startBtn.textContent = state.activities.gathering ? '🛑 Stop Gathering' : '🪓 Start Gathering';
    startBtn.onclick = () => state.activities.gathering ? window.stopActivity('gathering') : window.startActivity('gathering');
  }

  const statsCard = document.getElementById('gatheringStatsCard');
  if (statsCard) statsCard.style.display = state.activities.gathering ? 'block' : 'none';

  if (state.activities.gathering) {
    setText('resourcesGathered', state.gathering.resourcesGained || 0);
    const rate = getGatheringRate(state);
    setText('currentGatheringRate', `${rate.toFixed(1)}/sec`);
  }
}

export function updateGatheringSidebar(state = S) {
  if (!state.gathering) return;
  setText('gatheringLevel', `Level ${state.gathering.level}`);
  const fill = document.getElementById('gatheringProgressFill');
  if (fill) {
    const progressPct = Math.floor(state.gathering.exp / state.gathering.expMax * 100);
    fill.style.width = progressPct + '%';
    setText('gatheringProgressText', progressPct + '%');
  }
}

export function mountGatheringUI(state = S) {
  on('RENDER', () => {
    updateActivityGathering(state);
    updateGatheringSidebar(state);
  });

  updateActivityGathering(state);
  updateGatheringSidebar(state);
}
