import { S } from '../../../shared/state.js';
import { setText, log } from '../../../shared/utils/dom.js';
import { on } from '../../../shared/events.js';
import { startForging } from '../mutators.js';

function updateForgingActivity(state = S) {
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
  const itemSel = document.getElementById('forgeItemSelect');
  if (itemSel) {
    const prev = itemSel.value;
    itemSel.innerHTML = '';

    // Gather all forgeable equipment regardless of inventory structure
    const items = Array.isArray(state.inventory)
      ? state.inventory.filter(it => it.type === 'weapon' || it.type === 'armor')
      : [
          ...(state.inventory?.weapons || []),
          ...(state.inventory?.armor || []),
        ];

    items.forEach(it => {
      const opt = document.createElement('option');
      opt.value = String(it.id);
      opt.textContent = it.name || it.id;
      itemSel.appendChild(opt);
    });

    if (prev) itemSel.value = prev;
    // Ensure something is selected so the forge button works
    if (!itemSel.value && itemSel.options.length) itemSel.selectedIndex = 0;
  }
  const btn = document.getElementById('startForgingBtn');
  if (btn) {
    if (state.activities.forging) {
      btn.textContent = '🛑 Stop Forging';
      btn.onclick = () => { state.forging.current = null; window.stopActivity('forging'); };
    } else {
      btn.textContent = 'Start Forging';
      btn.onclick = () => {
        const itemId = document.getElementById('forgeItemSelect')?.value;
        const element = document.getElementById('forgeElementSelect')?.value;
        if (!itemId || !element) {
          log?.('Select an item and element to forge', 'bad');
          return;
        }
        window.startActivity('forging');
        startForging(itemId, element, state);
      };
    }
  }
}

function updateForgingSidebar(state = S) {
  if (!state.forging) return;
  setText('forgingLevelSidebar', `Level ${state.forging.level}`);
  const fill = document.getElementById('forgingProgressFillSidebar');
  if (fill) {
    const pct = (state.forging.exp / state.forging.expMax) * 100;
    fill.style.width = pct + '%';
    setText('forgingProgressTextSidebar', pct.toFixed(0) + '%');
  }
}

export function mountForgingUI(state = S) {
  on('RENDER', () => {
    updateForgingActivity(state);
    updateForgingSidebar(state);
  });
  updateForgingActivity(state);
  updateForgingSidebar(state);
}
