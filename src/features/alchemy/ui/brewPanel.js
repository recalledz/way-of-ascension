import { S } from '../../../game/state.js';
import { on } from '../../../shared/events.js';
import { setText } from '../../../game/utils.js';
import { startBrew, completeBrew, RECIPES } from '../mutators.js';
import { getAlchemyQueue } from '../selectors.js';

export function mountAlchemyUI(state = S) {
  const recipeSelect = document.getElementById('recipeSelect');
  const brewBtn = document.getElementById('brewBtn');
  if (brewBtn && recipeSelect) {
    brewBtn.addEventListener('click', () => {
      const recipe = RECIPES[recipeSelect.value];
      startBrew(state, recipe);
      render();
    });
  }

  function render() {
    setText('alchLvl', state.alchemy.level);
    setText('alchXp', state.alchemy.xp);
    setText('slotCount', state.alchemy.maxSlots);

    if (recipeSelect) {
      recipeSelect.innerHTML = '';
      state.alchemy.knownRecipes.forEach(key => {
        const r = RECIPES[key];
        if (r) {
          const opt = document.createElement('option');
          opt.value = key;
          opt.textContent = r.name;
          recipeSelect.appendChild(opt);
        }
      });
    }

    const table = document.getElementById('queueTable');
    if (table) {
      table.innerHTML = '';
      getAlchemyQueue(state).forEach((q, i) => {
        const tr = document.createElement('tr');
        const progress = q.total > 0 ? ((q.total - q.t) / q.total * 100).toFixed(0) : '0';
        tr.innerHTML = `<td>${q.name}</td><td>${progress}%</td><td>${q.done ? 'Done' : 'Brewing'}</td>`;
        const td = document.createElement('td');
        if (q.done) {
          const btn = document.createElement('button');
          btn.className = 'btn small';
          btn.textContent = 'Collect';
          btn.addEventListener('click', () => { completeBrew(state, i); render(); });
          td.appendChild(btn);
        }
        tr.appendChild(td);
        table.appendChild(tr);
      });
    }
  }

  on('RENDER', render);
  render();
}
