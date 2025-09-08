import { on } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';
import { ALCHEMY_RECIPES } from '../data/recipes.js';

function render(state) {
  setText('alchLvl', state.alchemy.level);
  setText('alchXp', state.alchemy.xp);
  const timer = state.alchemy.lab?.activeJobs?.[0]?.remaining ?? 0;
  setText('labTimer', timer.toFixed(1));

  const list = document.getElementById('recipeList');
  if (list) {
    list.innerHTML = '';
    Object.keys(state.alchemy.knownRecipes || {}).forEach(key => {
      const recipe = ALCHEMY_RECIPES[key];
      const li = document.createElement('li');
      li.textContent = recipe?.name || key;
      list.appendChild(li);
    });
  }
}

export function mountAlchemyUI(state) {
  document.querySelectorAll('#activity-alchemy .alchemy-subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.subtab;
      document.querySelectorAll('#activity-alchemy .alchemy-subtab').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('#activity-alchemy .alchemy-subtab-content').forEach(panel => {
        panel.style.display = panel.id === id ? '' : 'none';
      });
    });
  });

  on('RENDER', () => render(state));
  render(state);
}
