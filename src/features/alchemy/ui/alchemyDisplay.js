import { on } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';
import { ALCHEMY_RECIPES } from '../data/recipes.js';
import { startBrew, completeBrew } from '../mutators.js';
import { getQueue, getMaxSlots } from '../selectors.js';

function renderRecipes(state){
  const select = document.getElementById('recipeSelect');
  if(!select) return;
  select.innerHTML = '';
  const alch = state.alchemy;
  alch.knownRecipes.forEach(key => {
    const r = ALCHEMY_RECIPES[key];
    if(!r) return;
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = r.name;
    select.appendChild(opt);
  });
}

function renderQueue(state){
  const tbody = document.getElementById('queueTable');
  if(!tbody) return;
  tbody.innerHTML = '';
  getQueue(state).forEach((q,i) => {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.textContent = q.name;
    const progTd = document.createElement('td');
    const progress = ((q.T - q.t) / q.T * 100).toFixed(0);
    progTd.textContent = `${progress}%`;
    const statusTd = document.createElement('td');
    statusTd.textContent = q.done ? 'Done' : q.t.toFixed(1) + 's';
    const btnTd = document.createElement('td');
    const btn = document.createElement('button');
    btn.textContent = 'Collect';
    btn.disabled = !q.done;
    btn.addEventListener('click', () => {
      completeBrew(state, i);
      render(state);
    });
    btnTd.appendChild(btn);
    tr.appendChild(nameTd);
    tr.appendChild(progTd);
    tr.appendChild(statusTd);
    tr.appendChild(btnTd);
    tbody.appendChild(tr);
  });
}

function render(state){
  setText('alchLvl', state.alchemy.level);
  setText('alchXp', state.alchemy.xp);
  setText('slotCount', getMaxSlots(state));
  renderRecipes(state);
  renderQueue(state);
}

export function mountAlchemyUI(state){
  const brewBtn = document.getElementById('brewBtn');
  if(brewBtn){
    brewBtn.addEventListener('click', () => {
      const select = document.getElementById('recipeSelect');
      const key = select?.value;
      const recipe = ALCHEMY_RECIPES[key];
      if(recipe && startBrew(state, recipe)) render(state);
    });
  }
  on('RENDER', () => render(state));
  render(state);
}
