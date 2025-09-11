import { on } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';
import { ALCHEMY_RECIPES } from '../data/recipes.js';
import { startConcoct } from '../mutators.js';
import { getSuccessChance, getAlchemySpeedBonus, getQiDrainMultiplier, getLabSlots } from '../selectors.js';

function describeEffect(recipe) {
  const eff = recipe.effects || {};
  if (eff.qiRestorePct) return `Restores ${eff.qiRestorePct}% Qi`;
  if (eff.stats) {
    return Object.entries(eff.stats)
      .map(([stat, val]) => `+${val} ${stat}`)
      .join(', ');
  }
  if (eff.status === 'pill_body_t1') return 'Boosts attack and armor for 30s';
  if (eff.status === 'pill_breakthrough_t1') return '+10% breakthrough success for 60s';
  if (eff.status === 'pill_meridian_opening_t1') return '+20% breakthrough chance for 30s';
  return '';
}

function render(state) {
  setText('alchLvl', state.alchemy.level);
  setText('alchXp', state.alchemy.xp);
  const lab = state.alchemy.lab;
  setText('labSlotsDisplay', getLabSlots(state));
  const timer = lab?.activeJobs?.[0]?.remaining ?? 0;
  setText('labTimer', timer.toFixed(1));
  setText('labStatus', lab.paused ? 'Paused' : lab.activeJobs.length ? 'Running' : 'Idle');
  const speedBonus = getAlchemySpeedBonus(state);
  const timeRed = Math.round((speedBonus / (1 + speedBonus)) * 100);
  const success = Math.round(getSuccessChance(state) * 100);
  const qiRed = Math.round((1 - getQiDrainMultiplier(state)) * 100);
  setText('labTimeBonus', `-${timeRed}%`);
  setText('labSuccessBonus', `${success}%`);
  setText('labDrainBonus', `-${qiRed}%`);

  const recipeSel = document.getElementById('labRecipeSelect');
  if (recipeSel && recipeSel.options.length !== Object.keys(state.alchemy.knownRecipes || {}).length) {
    recipeSel.innerHTML = '';
    Object.keys(state.alchemy.knownRecipes || {}).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = ALCHEMY_RECIPES[key]?.name || key;
      recipeSel.appendChild(opt);
    });
  }

  const jobsList = document.getElementById('labJobs');
  if (jobsList) {
    jobsList.innerHTML = '';
    lab.activeJobs.forEach(job => {
      const li = document.createElement('li');
      const name = ALCHEMY_RECIPES[job.recipeKey]?.name || job.recipeKey;
      li.textContent = `${name} - ${job.remaining.toFixed(1)}s`;
      jobsList.appendChild(li);
    });
    lab.queue.forEach(job => {
      const li = document.createElement('li');
      const name = ALCHEMY_RECIPES[job.recipeKey]?.name || job.recipeKey;
      li.textContent = `[Q] ${name}`;
      jobsList.appendChild(li);
    });
    const noJobs = document.getElementById('labNoJobs');
    if (noJobs) noJobs.style.display = (lab.activeJobs.length || lab.queue.length) ? 'none' : '';
  }

  const list = document.getElementById('recipeList');
  if (list) {
    list.innerHTML = '';
    Object.keys(state.alchemy.knownRecipes || {}).forEach(key => {
      const recipe = ALCHEMY_RECIPES[key];
      const row = document.createElement('tr');
      if (recipe) {
        const tier = recipe.tiers?.[1] || {};
        const cost = Object.entries(tier.inputs || {})
          .map(([mat, qty]) => `${qty} ${mat}`)
          .join(', ') || '—';
        const qi = tier.qiCost ?? 0;
        const time = tier.baseTime ?? 0;
        const crafted = state.alchemy.recipeStats?.[key]?.crafted || 0;
        const effect = describeEffect(recipe);
        const success = Math.round(getSuccessChance(state) * 100);
        row.innerHTML = `<td>${recipe.name}</td><td>${cost}</td><td>${qi}</td><td>${time}s</td><td>${success}%</td><td>${effect}</td><td>${crafted}</td>`;
      } else {
        row.innerHTML = `<td colspan="7">${key}</td>`;
      }
      list.appendChild(row);
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

  const startBtn = document.getElementById('labStart');
  startBtn?.addEventListener('click', () => {
    const recipeKey = document.getElementById('labRecipeSelect')?.value;
    const qty = Math.max(1, parseInt(document.getElementById('labQty')?.value, 10) || 1);
    const recipe = ALCHEMY_RECIPES[recipeKey];
    const tier = recipe?.tiers?.[1] || {};
    for (let i = 0; i < qty; i++) {
      startConcoct({
        recipeKey,
        duration: tier.baseTime || 0,
        output: { itemKey: recipe.lineKey, qty: 1, tier: 1, type: 'pill' },
        exp: 1,
      }, state);
    }
    render(state);
  });

  on('RENDER', () => render(state));
  render(state);
}
