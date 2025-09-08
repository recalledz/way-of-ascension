import { on } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';
import { ALCHEMY_RECIPES } from '../data/recipes.js';
import { PILL_LINES } from '../data/pills.js';
import { usePill } from '../mutators.js';
import { inspectPillResistance } from '../selectors.js';

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

  const tempList = document.getElementById('tempPillsList');
  const permList = document.getElementById('permPillsList');
  if (tempList && permList) {
    tempList.innerHTML = '';
    permList.innerHTML = '';
    const outputs = state.alchemy.outputs || {};
    Object.keys(outputs).forEach(lineKey => {
      const out = outputs[lineKey];
      if (out.type !== 'pill') return;
      const meta = PILL_LINES[lineKey] || { name: lineKey, class: 'temporary' };
      const tiers = out.tiers && Object.keys(out.tiers).length ? out.tiers : { 1: out.qty };
      Object.entries(tiers).forEach(([tierStr, qty]) => {
        const tier = Number(tierStr);
        if (qty <= 0) return;
        const li = document.createElement('li');
        li.className = 'pill-entry';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = meta.name;
        const tierSpan = document.createElement('span');
        tierSpan.className = 'chip';
        tierSpan.textContent = `T${tier}`;
        const qtySpan = document.createElement('span');
        qtySpan.textContent = `x${qty}`;
        li.append(nameSpan, tierSpan, qtySpan);
        if (lineKey === 'meridian_opening_dan') {
          const inst = state.statuses?.pill_meridian_opening_t1;
          if (inst) {
            const timerSpan = document.createElement('span');
            timerSpan.className = 'chip pill-timer';
            timerSpan.textContent = `${Math.ceil(inst.duration)}s`;
            if (inst.duration <= 3) timerSpan.classList.add('pulse');
            li.appendChild(timerSpan);
          }
        }
        const useBtn = document.createElement('button');
        useBtn.textContent = 'Use';
        useBtn.className = 'btn small';
        useBtn.addEventListener('click', () => {
          const res = usePill(state, lineKey, tier);
          if (res.ok) render(state);
        });
        const coBtn = document.createElement('button');
        coBtn.textContent = '⇄';
        coBtn.className = 'btn small ghost';
        coBtn.title = 'Coalesce';
        coBtn.addEventListener('click', () => {
          const btn = document.querySelector('#activity-alchemy .alchemy-subtab[data-subtab="coalesce"]');
          btn?.click();
        });
        li.append(useBtn, coBtn);
        if (meta.class === 'permanent') {
          const info = inspectPillResistance(lineKey, tier, state);
          if (info) {
            li.title = `rp ${info.rp.toFixed(1)}/${info.rpCap}\ncur ${info.effectiveMultiplier.toFixed(2)}\nnext ${info.nextGain.toFixed(2)}`;
          }
        }
        const targetList = meta.class === 'permanent' ? permList : tempList;
        targetList.appendChild(li);
      });
    });
    document.getElementById('noTempPills').style.display = tempList.children.length ? 'none' : '';
    document.getElementById('noPermPills').style.display = permList.children.length ? 'none' : '';
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

  document.querySelectorAll('#activity-alchemy .pill-open-recipes').forEach(btn => {
    btn.addEventListener('click', () => {
      const recipeBtn = document.querySelector('#activity-alchemy .alchemy-subtab[data-subtab="recipe-book"]');
      recipeBtn?.click();
    });
  });

  on('RENDER', () => render(state));
  render(state);
}
