import { S } from '../../../shared/state.js';
import { setText, log } from '../../../shared/utils/dom.js';
import { fmt } from '../../../shared/utils/number.js';
import { on } from '../../../shared/events.js';
import { getGatheringRate } from '../logic.js';

export function updateActivityGathering(state = S) {
  if (!state.gathering) return;
  setText('gatheringLevelActivity', state.gathering.level);
  setText('gatheringExpActivity', Math.floor(state.gathering.exp));
  setText('gatheringExpMaxActivity', state.gathering.expMax);

  const resourceNames = { wood: 'Wood', herbs: 'Herbs' };
  const current = state.activities.gathering ? (resourceNames[state.gathering.selectedResource] || 'Nothing') : 'Nothing';
  setText('currentlyGathering', current);

  const gatheringFillActivity = document.getElementById('gatheringFillActivity');
  if (gatheringFillActivity) {
    gatheringFillActivity.style.width = (state.gathering.exp / state.gathering.expMax * 100) + '%';
  }

  const startBtn = document.getElementById('startGatheringActivity');
  if (startBtn) {
    startBtn.textContent = state.activities.gathering ? '🛑 Stop Gathering' : '🪓 Start Gathering';
    startBtn.onclick = () => state.activities.gathering ? window.stopActivity('gathering') : window.startActivity('gathering');
  }

  const selectedRadio = document.querySelector(`input[name="gatheringResource"][value="${state.gathering.selectedResource}"]`);
  if (selectedRadio) selectedRadio.checked = true;

  const herbsOption = document.getElementById('herbsOption');
  if (herbsOption) herbsOption.style.display = state.gathering.unlockedResources?.includes('herbs') ? 'block' : 'none';

  const gatheringStatsCard = document.getElementById('gatheringStatsCard');
  if (gatheringStatsCard) gatheringStatsCard.style.display = state.activities.gathering ? 'block' : 'none';

  if (state.activities.gathering) {
    setText('gatheredResource', state.gathering.resourcesGained || 0);
    setText('gatheredResourceLabel', `${resourceNames[state.gathering.selectedResource] || 'Resource'} Collected`);
    const baseRate = getGatheringRate(state.gathering.selectedResource, state);
    setText('currentGatheringRate', `${baseRate.toFixed(1)}/sec`);
  }

  updateGatheringRateDisplays(state);
}

function updateGatheringRateDisplays(state = S) {
  const woodRate = getGatheringRate('wood', state);
  setText('woodRate', `+${woodRate.toFixed(1)}/sec`);
  const herbsRateEl = document.getElementById('herbsRate');
  if (herbsRateEl) {
    const herbsRate = getGatheringRate('herbs', state);
    setText('herbsRate', `+${herbsRate.toFixed(1)}/sec`);
  }
}

export function updateGatheringSidebar(state = S) {
  if (!state.gathering) return;
  setText('gatheringLevel', `Level ${state.gathering.level}`);
  const fill = document.getElementById('gatheringProgressFill');
  if (fill) {
    const progressPct = Math.floor(state.gathering.exp / state.gathering.expMax * 100);
    fill.style.width = progressPct + '%';
    setText('gatheringProgressText', `${fmt(state.gathering.exp)} / ${fmt(state.gathering.expMax)} XP`);
  }
}

export function mountGatheringUI(state = S) {
  on('RENDER', () => {
    updateActivityGathering(state);
    updateGatheringSidebar(state);
  });

  const gatheringResourceInputs = document.querySelectorAll('input[name="gatheringResource"]');
  gatheringResourceInputs.forEach(input => {
    input.addEventListener('change', e => {
      if (!state.gathering) return;
      state.gathering.selectedResource = e.target.value;
      state.gathering.resourcesGained = 0;
      log(`Switched gathering to ${e.target.value === 'wood' ? 'Wood' : e.target.value}`, 'good');
    });
  });

  updateActivityGathering(state);
  updateGatheringSidebar(state);
}
