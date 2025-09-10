import { S } from '../../../shared/state.js';
import { setText } from '../../../shared/utils/dom.js';
import { fmt } from '../../../shared/utils/number.js';
import { on } from '../../../shared/events.js';
import { startForging } from '../mutators.js';
import { startActivity as startActivityMut } from '../../activity/mutators.js';

function displayName(it) {
  if (!it) return '';
  return it.name || it.key || it.id;
}

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
      status.textContent = `Forging... ${Math.ceil(state.forging.current.time)}s`;
    } else status.textContent = 'Idle';
  }
}

function updateForgeInventory(state = S) {
  if (!state.forging) return;
  const list = document.getElementById('forgeInventory');
  if (!list) return;
  list.innerHTML = '';
  state.inventory?.filter(it => it.type === 'weapon' || it.type === 'gear')
    .forEach(it => {
      const card = document.createElement('div');
      card.className = 'forge-item-card';
      card.textContent = displayName(it);
      if (String(state.forging.slot) === String(it.id)) card.classList.add('selected');
      card.onclick = () => {
        state.forging.slot = it.id;
        updateForgeSlot(state);
        updateForgeInventory(state);
      };
      list.appendChild(card);
    });
}

function updateForgeSlot(state = S) {
  if (!state.forging) return;
  const slot = document.getElementById('forgeSlot');
  const opts = document.getElementById('forgeOptions');
  const req = document.getElementById('forgeReqs');
  if (!slot || !opts || !req) return;
  if (!state.forging.slot) {
    slot.textContent = 'Empty';
    opts.innerHTML = '';
    req.textContent = '';
    return;
  }
  const item = state.inventory?.find(it => String(it.id) === String(state.forging.slot));
  slot.textContent = displayName(item);
  opts.innerHTML = '';
  const tier = item?.tier || 0;
  const woodCost = (tier + 1) * 10;
  const stoneCost = (tier + 1) * 5;
  const qiCost = (tier + 1) * 10;
  const action = tier === 0 ? 'Align' : 'Imbue';
  req.textContent = `${action} requires ${woodCost} wood, ${stoneCost} spirit stones, ${qiCost} qi`;
  const elementSel = document.createElement('select');
  elementSel.id = 'forgeElementSelect';
  ['wood', 'fire', 'water', 'earth', 'metal'].forEach(el => {
    const opt = document.createElement('option');
    opt.value = el;
    opt.textContent = el[0].toUpperCase() + el.slice(1);
    elementSel.appendChild(opt);
  });
  if (item?.element) elementSel.value = item.element;
  opts.appendChild(elementSel);
  if ((item?.tier || 0) === 0) {
    const alignBtn = document.createElement('button');
    alignBtn.className = 'btn small';
    alignBtn.textContent = 'Align';
    alignBtn.onclick = () => {
      const element = elementSel.value;
      startForging(item.id, element, state);
      startActivityMut(state, 'forging');
      updateForgeSlot(state);
      updateForgeInventory(state);
    };
    opts.appendChild(alignBtn);
  } else {
    const imbBtn = document.createElement('button');
    imbBtn.className = 'btn small';
    imbBtn.textContent = 'Imbue';
    imbBtn.onclick = () => {
      const element = item.element || elementSel.value;
      startForging(item.id, element, state);
      startActivityMut(state, 'forging');
      updateForgeSlot(state);
      updateForgeInventory(state);
    };
    opts.appendChild(imbBtn);
  }
}

function updateForgingSidebar(state = S) {
  if (!state.forging) return;
  setText('forgingLevelSidebar', `Level ${state.forging.level}`);
  const fill = document.getElementById('forgingProgressFillSidebar');
  if (fill) {
    const pct = (state.forging.exp / state.forging.expMax) * 100;
    fill.style.width = pct + '%';
  }
  const text = document.getElementById('forgingProgressTextSidebar');
  if (text) text.textContent = `${fmt(state.forging.exp)} / ${fmt(state.forging.expMax)}`;
}

export function mountForgingUI(state = S) {
  on('RENDER', () => {
    updateForgingActivity(state);
    updateForgingSidebar(state);
    updateForgeInventory(state);
    updateForgeSlot(state);
  });
  updateForgingActivity(state);
  updateForgingSidebar(state);
  updateForgeInventory(state);
  updateForgeSlot(state);
}
