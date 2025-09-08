import { SECT_BUILDINGS } from '../data/buildings.js';
import { getBuildingLevel } from '../selectors.js';
import { getBuildingCost } from '../logic.js';
import { upgradeBuilding } from '../mutators.js';
import { on } from '../../../shared/events.js';
import { updateActivitySelectors } from '../../activity/ui/activityUI.js';

function renderBuildings(state){
  const container = document.getElementById('buildingsContainer');
  if(!container) return;
  container.innerHTML = '';
  for(const [key, b] of Object.entries(SECT_BUILDINGS)){
    const level = getBuildingLevel(key, state);
    const next = level + 1;

    const card = document.createElement('div');
    card.className = 'building-card';

    const title = document.createElement('h5');
    title.textContent = `${b.icon} ${b.name} (Lv ${level}/${b.maxLevel})`;
    card.appendChild(title);

    const effect = document.createElement('div');
    effect.className = 'effect';
    if(next > b.maxLevel){
      effect.textContent = b.effects[level]?.desc || '';
    } else {
      effect.textContent = b.effects[next]?.desc || '';
    }
    card.appendChild(effect);

    const costDiv = document.createElement('div');
    costDiv.className = 'materials';
    if(next > b.maxLevel){
      costDiv.textContent = 'Max level';
    } else {
      const cost = getBuildingCost(key, next);
      const nodes = [];
      Object.entries(cost).forEach(([res, amt], idx, arr) => {
        const span = document.createElement('span');
        const cur = state[res] || 0;
        span.textContent = `${cur}/${amt} ${res}`;
        span.style.color = cur >= amt ? 'red' : 'green';
        nodes.push(span);
        if(idx < arr.length - 1) nodes.push(document.createTextNode(', '));
      });
      costDiv.append(...nodes);
    }
    card.appendChild(costDiv);

    const btn = document.createElement('button');
    btn.className = 'btn small';
    btn.textContent = next > b.maxLevel ? 'Max' : 'Upgrade';
    btn.disabled = next > b.maxLevel;
    btn.addEventListener('click', () => {
      if(upgradeBuilding(state, key)){
        render(state);
        updateActivitySelectors(state);
      }
    });
    card.appendChild(btn);

    container.appendChild(card);
  }
}

function render(state){
  renderBuildings(state);
}

export function mountSectUI(state){
  on('RENDER', () => render(state));
  render(state);
}
