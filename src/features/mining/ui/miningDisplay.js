import { S } from '../../../shared/state.js';
import { setText, log } from '../../../shared/utils/dom.js';
import { on } from '../../../shared/events.js';
import { getMiningRate } from '../logic.js';

export function updateActivityMining(state = S) {
  if (!state.mining) return;
  setText('miningLevelActivity', state.mining.level);
  setText('miningExpActivity', Math.floor(state.mining.exp));
  setText('miningExpMaxActivity', state.mining.expMax);

  const resourceNames = { stones: 'Spirit Stones', iron: 'Iron Ore', ice: 'Ice Crystal' };
  const current = state.activities.mining ? (resourceNames[state.mining.selectedResource] || 'Unknown') : 'Nothing';
  setText('currentlyMining', current);

  const miningFillActivity = document.getElementById('miningFillActivity');
  if (miningFillActivity) {
    miningFillActivity.style.width = (state.mining.exp / state.mining.expMax * 100) + '%';
  }

  const startBtn = document.getElementById('startMiningActivity');
  if (startBtn) {
    startBtn.textContent = state.activities.mining ? '🛑 Stop Mining' : '⛏️ Start Mining';
    startBtn.onclick = () => state.activities.mining ? window.stopActivity('mining') : window.startActivity('mining');
  }

  const ironOption = document.getElementById('ironOption');
  const iceOption = document.getElementById('iceOption');
  if (ironOption) ironOption.style.display = state.mining.level >= 3 ? 'block' : 'none';
  if (iceOption) iceOption.style.display = state.mining.level >= 15 ? 'block' : 'none';

  const selectedRadio = document.querySelector(`input[name="miningResource"][value="${state.mining.selectedResource}"]`);
  if (selectedRadio) selectedRadio.checked = true;

  const miningStatsCard = document.getElementById('miningStatsCard');
  if (miningStatsCard) miningStatsCard.style.display = state.activities.mining ? 'block' : 'none';

  if (state.activities.mining) {
    setText('resourcesGained', state.mining.resourcesGained || 0);
    const baseRate = getMiningRate(state.mining.selectedResource, state);
    setText('currentMiningRate', `${baseRate.toFixed(1)}/sec`);
  }

  updateMiningRateDisplays(state);
}

function updateMiningRateDisplays(state = S) {
  const stonesRate = getMiningRate('stones', state);
  const ironRate = getMiningRate('iron', state);
  const iceRate = getMiningRate('ice', state);
  setText('stonesRate', `+${stonesRate.toFixed(1)}/sec`);
  setText('ironRate', `+${ironRate.toFixed(1)}/sec`);
  setText('iceRate', `+${iceRate.toFixed(1)}/sec`);
}

export function updateMiningSidebar(state = S) {
  if (!state.mining) return;
  setText('miningLevel', `Level ${state.mining.level}`);
  const miningFill = document.getElementById('miningProgressFill');
  if (miningFill) {
    const progressPct = Math.floor(state.mining.exp / state.mining.expMax * 100);
    miningFill.style.width = progressPct + '%';
    setText('miningProgressText', progressPct + '%');
  }
}

export function mountMiningUI(state = S) {
  on('RENDER', () => {
    updateActivityMining(state);
    updateMiningSidebar(state);
  });

  const miningResourceInputs = document.querySelectorAll('input[name="miningResource"]');
  miningResourceInputs.forEach(input => {
    input.addEventListener('change', e => {
      if (!state.mining) return;
      state.mining.selectedResource = e.target.value;
      state.mining.resourcesGained = 0;
      log(`Switched mining to ${e.target.value === 'stones' ? 'Spirit Stones' : e.target.value === 'iron' ? 'Iron Ore' : 'Ice Crystal'}`, 'good');
    });
  });

  updateActivityMining(state);
  updateMiningSidebar(state);
}
