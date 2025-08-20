import { SECT_BUILDINGS } from '../data/buildings.js';
import { getBuildingLevel, getBuildingBonuses } from '../selectors.js';
import { upgradeBuilding } from '../mutators.js';
import { on } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';

function renderBuildings(state){
  const container = document.getElementById('buildingsContainer');
  if(!container) return;
  container.innerHTML = '';
  for(const [key, b] of Object.entries(SECT_BUILDINGS)){
    const level = getBuildingLevel(key, state);
    const next = level + 1;
    const row = document.createElement('div');
    row.className = 'building-row';
    const label = document.createElement('span');
    label.textContent = `${b.icon} ${b.name} (Lv ${level})`;
    row.appendChild(label);
    const btn = document.createElement('button');
    btn.textContent = next > b.maxLevel ? 'Max' : 'Upgrade';
    btn.disabled = next > b.maxLevel;
    btn.addEventListener('click', () => {
      if(upgradeBuilding(state, key)) render(state);
    });
    row.appendChild(btn);
    container.appendChild(row);
  }
}

function renderDisciples(state){
  const bonuses = getBuildingBonuses(state);
  const total = (state.disciples || 0) + (bonuses.disciples || 0);
  setText('discTotal', total);
}

function render(state){
  renderBuildings(state);
  renderDisciples(state);
}

export function mountSectUI(state){
  on('RENDER', () => render(state));
  render(state);
}
