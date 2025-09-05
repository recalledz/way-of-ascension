// src/features/activity/ui/activityUI.js
import { selectActivity } from "../mutators.js";
import { getActiveActivity } from "../selectors.js";
import { fCap, qCap } from "../../progression/selectors.js";
import { fmt } from "../../../shared/utils/number.js";

export function mountActivityUI(root) {
  const handle = name => {
    selectActivity(root, name);
    updateActivitySelectors(root);
    if (typeof globalThis.updateActivityContent === 'function') {
      globalThis.updateActivityContent();
    }
  };

  // Click handlers (new compact sidebar + legacy)
  document.querySelectorAll('.activity-item[data-activity]')
    .forEach(el => el.addEventListener('click', () => handle(el.dataset.activity)));

  document.getElementById('cultivationSelector')?.addEventListener('click', () => handle('cultivation'));
  document.getElementById('physiqueSelector')?.addEventListener('click', () => handle('physique'));
  document.getElementById('agilitySelector')?.addEventListener('click', () => handle('agility'));
  document.getElementById('miningSelector')?.addEventListener('click', () => handle('mining'));
  document.getElementById('gatheringSelector')?.addEventListener('click', () => handle('gathering'));
  document.getElementById('adventureSelector')?.addEventListener('click', () => handle('adventure'));
  document.getElementById('sectSelector')?.addEventListener('click', () => handle('sect'));
  document.getElementById('catchingSelector')?.addEventListener('click', () => handle('catching'));

  // Initial paint
  updateActivitySelectors(root);
  updateCurrentTaskDisplay(root);
}

export function updateActivitySelectors(root) {
  // Ensure minimal slices exist for UI reads
  root.physique ??= { level: 1, exp: 0, expMax: 100 };
  root.agility  ??= { level: 1, exp: 0, expMax: 100 };
  root.mining   ??= { level: 1, exp: 0, expMax: 100 };
  root.gathering ??= { level: 1, exp: 0, expMax: 100 };
  root.catching ??= { level: 1, exp: 0, expMax: 100 };

  const selected = root.ui?.selectedActivity || 'cultivation';

  // Generic highlight for dynamically rendered sidebar items
  document.querySelectorAll('.activity-item[data-activity]')
    .forEach(el => {
      const act = el.dataset.activity;
      el.classList.toggle('active', act === selected);
      el.classList.toggle('running', !!root.activities?.[act]);
    });

  document.querySelectorAll('.activity-content')
    .forEach(panel => {
      panel.style.display = panel.id === `activity-${selected}` ? 'block' : 'none';
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

  const cultivationTab = document.querySelector('.activity-item[data-activity="cultivation"]');
  if (cultivationTab) {
    const breakthroughReady = root.foundation >= fCap(root) && (root.qi ?? 0) >= qCap(root);
    cultivationTab.classList.toggle('breakthrough-ready', breakthroughReady);
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

  const agiSel = document.getElementById('agilitySelector');
  const agiFill = document.getElementById('agilitySelectorFill');
  const agiInfo = document.getElementById('agilityInfo');
  const agiText = document.getElementById('agilityProgressText');
  agiSel?.classList.toggle('active', selected === 'agility');
  agiSel?.classList.toggle('running', root.activities?.agility);
  if (agiFill && agiInfo) {
    const expFrac = root.agility.exp / root.agility.expMax;
    agiFill.style.width = `${expFrac * 100}%`;
    agiInfo.textContent = root.activities?.agility ? 'Training...' : `Level ${root.agility.level}`;
    if (agiText) agiText.textContent = `${fmt(root.agility.exp)} / ${fmt(root.agility.expMax)} XP`;
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

  // Gathering
  const gatheringSel = document.getElementById('gatheringSelector');
  const gatheringFill = document.getElementById('gatheringSelectorFill');
  const gatheringInfo = document.getElementById('gatheringInfo');
  gatheringSel?.classList.toggle('active', selected === 'gathering');
  gatheringSel?.classList.toggle('running', root.activities?.gathering);
  if (gatheringFill && gatheringInfo) {
    const expPct = (root.gathering.exp / root.gathering.expMax) * 100;
    gatheringFill.style.width = `${expPct}%`;
    gatheringInfo.textContent = root.activities?.gathering ? 'Gathering...' : `Level ${root.gathering.level}`;
  }

  // Catching
  const catchSel = document.getElementById('catchingSelector');
  const catchFill = document.getElementById('catchingProgressFill');
  const catchInfo = document.getElementById('catchingLevel');
  catchSel?.classList.toggle('active', selected === 'catching');
  catchSel?.classList.toggle('running', root.activities?.catching);
  if (catchFill && catchInfo) {
    const expPct = (root.catching.exp / root.catching.expMax) * 100;
    catchFill.style.width = `${expPct}%`;
    catchInfo.textContent = root.activities?.catching ? 'Catching...' : `Level ${root.catching.level}`;
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
  const map = {
    cultivation: 'Cultivating',
    physique: 'Physique Training',
    mining: 'Mining',
    gathering: 'Gathering',
    forging: 'Forging',
    agility: 'Agility Training',
    adventure: 'Adventuring',
    catching: 'Catching',
    cooking: 'Cooking',
    alchemy: 'Brewing'
  };
  const active = getActiveActivity(root);
  el.textContent = active ? (map[active] || 'Idle') : 'Idle';
}
