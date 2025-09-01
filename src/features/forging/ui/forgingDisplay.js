import { setText, log } from '../../../shared/utils/dom.js';
import { on } from '../../../shared/events.js';
import { startForging } from '../mutators.js';
import { getInventoryItems } from '../logic.js';

function updateForgingActivity(state) {
  if (!state.forging) return;
  setText('forgingLevel', state.forging.level);
  setText('forgingExp', Math.floor(state.forging.exp));
  setText('forgingExpMax', state.forging.expMax);
  const fill = document.getElementById('forgingProgressFill');
  if (fill) {
    const pct = (state.forging.exp / state.forging.expMax) * 100;
    fill.style.width = pct + '%';
  }
  const status = document.getElementById('forgingStatus');
  if (status) {
    if (state.activities.forging && state.forging.current) {
      status.textContent = `Forging... ${Math.ceil(state.forging.current.time)}s`; }
    else status.textContent = 'Idle';
  }
  const gearList = document.getElementById('forgeGearList');
  if (gearList) {
    gearList.innerHTML = '';

    const items = getInventoryItems(state).filter(
      it => it.type === 'weapon' || it.type === 'armor'
    );

    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'inventory-row';
      row.innerHTML = `<span class="inv-name">${it.name || it.id}</span>`;
      const act = document.createElement('div');
      act.className = 'inv-actions';
      const btn = document.createElement('button');
      btn.className = 'btn small';
      btn.textContent = 'Place in Forge';
      btn.onclick = () => {
        const element = document.getElementById('forgeElementSelect')?.value;
        if (!element) { log?.('Select an element to forge', 'bad'); return; }
        window.startActivity('forging');
        startForging(it.id, element, state);
      };
      act.appendChild(btn);
      row.appendChild(act);
      gearList.appendChild(row);
    });
  }
}

function updateForgingSidebar(state) {
  if (!state.forging) return;
  setText('forgingLevelSidebar', `Level ${state.forging.level}`);
  const fill = document.getElementById('forgingProgressFillSidebar');
  if (fill) {
    const pct = (state.forging.exp / state.forging.expMax) * 100;
    fill.style.width = pct + '%';
    setText('forgingProgressTextSidebar', pct.toFixed(0) + '%');
  }
}

export function mountForgingUI(state) {
  on('RENDER', () => {
    updateForgingActivity(state);
    updateForgingSidebar(state);
  });
  updateForgingActivity(state);
  updateForgingSidebar(state);
}
