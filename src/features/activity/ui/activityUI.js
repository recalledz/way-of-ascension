// src/features/activity/ui/activityUI.js
import { selectActivity } from "../mutators.js";
import { getActiveActivity } from "../selectors.js";
import { fCap } from "../../progression/selectors.js";
import { on } from "../../../shared/events.js";

export function mountActivityUI(root) {
  // Click handlers (new compact sidebar + legacy)
  document.querySelectorAll('.activity-item[data-activity]')
    .forEach(el => el.addEventListener('click', () => selectActivity(root, el.dataset.activity)));

  document.getElementById('cultivationSelector')?.addEventListener('click', () => selectActivity(root, 'cultivation'));
  document.getElementById('physiqueSelector')?.addEventListener('click', () => selectActivity(root, 'physique'));
  document.getElementById('miningSelector')?.addEventListener('click', () => selectActivity(root, 'mining'));
  document.getElementById('adventureSelector')?.addEventListener('click', () => selectActivity(root, 'adventure'));
  document.getElementById('sectSelector')?.addEventListener('click', () => selectActivity(root, 'sect'));

  on("UI:ACTIVITY_SELECTED", () => updateActivitySelectors(root));

  // Initial paint
  updateActivitySelectors(root);
  updateCurrentTaskDisplay(root);
}

export function updateActivitySelectors(root) {
  // Ensure minimal slices exist for UI reads
  root.physique ??= { level: 1, exp: 0, expMax: 100 };
  root.mining   ??= { level: 1, exp: 0, expMax: 100 };

  const selected = root.ui?.selectedActivity || 'cultivation';

  document.querySelectorAll('.activity-content')
    .forEach(panel => {
      panel.style.display = panel.id === `activity-${selected}` ? '' : 'none';
    });

  // Cultivation
  const cultivationSelector = document.getElementById('cultivationSelector');
  const cultivationFill = document.getElementById('cultivationFill');
  const cultivationInfo = document.getElementById('cultivationInfo');
  cultivationSelector?.classList.toggle('active', selected === 'cultivation');
  cultivationSelector?.classList.toggle('running', root.activities?.cultivation);
  if (cultivationFill && cultivationInfo) {
    const foundationPct = (root.foundation / fCap(root)) * 100;
    cultivationFill.style.width = `${foundationPct}%`;
    cultivationInfo.textContent = root.activities?.cultivation ? 'Cultivating...' : 'Foundation Progress';
  }

  // Physique
  const physSel = document.getElementById('physiqueSelector');
  const physFill = document.getElementById('physiqueSelectorFill');
  const physInfo = document.getElementById('physiqueInfo');
  physSel?.classList.toggle('active', selected === 'physique');
  physSel?.classList.toggle('running', root.activities?.physique);
  if (physFill && physInfo) {
    const expPct = (root.physique.exp / root.physique.expMax) * 100;
    physFill.style.width = `${expPct}%`;
    physInfo.textContent = root.activities?.physique ? 'Training...' : `Level ${root.physique.level}`;
  }

  // Mining
  const miningSel = document.getElementById('miningSelector');
  const miningFill = document.getElementById('miningSelectorFill');
  const miningInfo = document.getElementById('miningInfo');
  miningSel?.classList.toggle('active', selected === 'mining');
  miningSel?.classList.toggle('running', root.activities?.mining);
  if (miningFill && miningInfo) {
    const expPct = (root.mining.exp / root.mining.expMax) * 100;
    miningFill.style.width = `${expPct}%`;
    miningInfo.textContent = root.activities?.mining ? 'Mining...' : `Level ${root.mining.level}`;
  }

  // Adventure
  const advSel = document.getElementById('adventureSelector');
  const advInfo = document.getElementById('adventureInfo');
  advSel?.classList.toggle('active', selected === 'adventure');
  advSel?.classList.toggle('running', root.activities?.adventure);
  if (advInfo) {
    const loc = root.adventure?.location || 'Village Outskirts';
    advInfo.textContent = root.activities?.adventure ? 'Exploring...' : loc;
  }

  // Sect tab indicator (simple)
  const sectSelector = document.getElementById('sectSelector');
  sectSelector?.classList.toggle('active', selected === 'sect');

  updateCurrentTaskDisplay(root);
}

export function updateCurrentTaskDisplay(root) {
  const el = document.getElementById('currentTask');
  if (!el) return;
  const map = { cultivation:'Cultivating', physique:'Physique Training', mining:'Mining', adventure:'Adventuring', cooking:'Cooking' };
  const active = getActiveActivity(root);
  el.textContent = active ? (map[active] || 'Idle') : 'Idle';
}
