import { on } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';
import { ALCHEMY_RECIPES } from '../data/recipes.js';
import { startBrew, completeBrew } from '../mutators.js';
import { getQueue, getMaxSlots } from '../selectors.js';

const RES_ICONS = { herbs: '🌿', ore: '⛏️', wood: '🪵', stones: '🪨' };

function renderAlchemyUI(state) {
  setText('alchLvl', state.alchemy.level);
  setText('alchXp', state.alchemy.xp);
  setText('slotCount', getMaxSlots(state));
  setText('alchemyLevelSidebar', `Level ${state.alchemy.level}`);

  const recipeSelect = document.getElementById('recipeSelect');
  const brewBtn = document.getElementById('brewBtn');
  if (recipeSelect && brewBtn) {
    if (!state.alchemy.unlocked) {
      recipeSelect.innerHTML = '<option value="">Alchemy not unlocked - Build Alchemy Laboratory</option>';
      recipeSelect.disabled = true;
      brewBtn.disabled = true;
      brewBtn.textContent = '🔒 Locked';
    } else {
      recipeSelect.disabled = false;
      brewBtn.disabled = false;
      brewBtn.textContent = '🔥 Brew';
      recipeSelect.innerHTML = '';
      state.alchemy.knownRecipes.forEach(key => {
        const recipe = ALCHEMY_RECIPES[key];
        if (!recipe) return;
        const opt = document.createElement('option');
        opt.value = key;
        let label = recipe.name;
        if (recipe.cost) {
          const costStr = Object.entries(recipe.cost)
            .map(([res, amt]) => `${amt}${RES_ICONS[res] || res}`)
            .join(' ');
          label += ` (${costStr}, ${recipe.time}s, ${Math.floor(recipe.base * 100)}%)`;
        }
        opt.textContent = label;
        recipeSelect.appendChild(opt);
      });
      Object.entries(ALCHEMY_RECIPES).forEach(([key, recipe]) => {
        if (state.alchemy.knownRecipes.includes(key)) return;
        if (recipe.unlockHint) {
          const opt = document.createElement('option');
          opt.value = '';
          opt.disabled = true;
          opt.textContent = `??? - ${recipe.unlockHint}`;
          recipeSelect.appendChild(opt);
        }
      });
    }
  }

  const tbody = document.getElementById('queueTable');
  if (tbody) {
    tbody.innerHTML = '';
    getQueue(state).forEach((q, i) => {
      const tr = document.createElement('tr');
      const nameTd = document.createElement('td');
      nameTd.textContent = q.name;
      const progTd = document.createElement('td');
      const progress = ((q.T - q.t) / q.T * 100).toFixed(0);
      progTd.textContent = `${progress}%`;
      const statusTd = document.createElement('td');
      statusTd.textContent = q.done ? 'Ready' : `${(q.T - q.t).toFixed(0)}s`;
      const btnTd = document.createElement('td');
      const btn = document.createElement('button');
      btn.textContent = 'Collect';
      btn.disabled = !q.done;
      btn.classList.add('btn', 'small');
      btn.addEventListener('click', () => {
        completeBrew(state, i);
        renderAlchemyUI(state);
      });
      btnTd.appendChild(btn);
      tr.appendChild(nameTd);
      tr.appendChild(progTd);
      tr.appendChild(statusTd);
      tr.appendChild(btnTd);
      tbody.appendChild(tr);
    });
  }
}

export function mountAlchemyUI(state) {
  const brewBtn = document.getElementById('brewBtn');
  if (brewBtn) {
    brewBtn.addEventListener('click', () => {
      const select = document.getElementById('recipeSelect');
      const key = select?.value;
      const recipe = ALCHEMY_RECIPES[key];
      if (recipe && startBrew(state, recipe)) renderAlchemyUI(state);
    });
  }
  on('RENDER', () => renderAlchemyUI(state));
  renderAlchemyUI(state);
}

