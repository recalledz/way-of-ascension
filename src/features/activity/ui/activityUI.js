// src/features/activity/ui/activityUI.js
import { selectActivity } from "../mutators.js";
import { getActiveActivity, getSelectedActivity } from "../selectors.js";
import { updateActivityCultivation } from "../../progression/ui/realm.js";
import { updateActivityAdventure } from "../../adventure/logic.js";
import { renderEquipmentPanel } from "../../inventory/ui/CharacterPanel.js";
import { updateActivityCooking } from "../../cooking/ui/cookingDisplay.js";
import { fCap, qCap } from "../../progression/selectors.js";
import { getBuildingLevel } from "../../sect/selectors.js";
import { fmt } from "../../../shared/utils/number.js";

export function mountActivityUI(root) {
  const handle = name => {
    selectActivity(root, name);
    updateActivitySelectors(root);
    renderActiveActivity(root);
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
  document.getElementById('settingsSelector')?.addEventListener('click', () => handle('settings'));
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
  root.forging  ??= { level: 1, exp: 0, expMax: 100 };
  root.cooking  ??= { level: 1, exp: 0, expMax: 100 };

  const kitchenBuilt = getBuildingLevel('kitchen', root) > 0;
  const forgingBuilt = getBuildingLevel('forging_room', root) > 0;
  let selected = root.ui?.selectedActivity || 'cultivation';
  if ((selected === 'cooking' && !kitchenBuilt) || (selected === 'forging' && !forgingBuilt)) {
    selected = 'cultivation';
    root.ui.selectedActivity = selected;
  }

  const cookItem = document.querySelector('.activity-item[data-activity="cooking"]');
  if (cookItem) cookItem.style.display = kitchenBuilt ? '' : 'none';
  const forgeItem = document.querySelector('.activity-item[data-activity="forging"]');
  if (forgeItem) forgeItem.style.display = forgingBuilt ? '' : 'none';

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
  const physText = document.getElementById('physiqueProgressTextSidebar');
  physSel?.classList.toggle('active', selected === 'physique');
  physSel?.classList.toggle('running', root.activities?.physique);
  const physPct = (root.physique.exp / root.physique.expMax) * 100;
  if (physFill) physFill.style.width = `${physPct}%`;
  if (physInfo) physInfo.textContent = root.activities?.physique ? 'Training...' : `Level ${root.physique.level}`;
  if (physText) physText.textContent = `${fmt(root.physique.exp)} / ${fmt(root.physique.expMax)}`;

  const agiSel = document.getElementById('agilitySelector');
  const agiFill = document.getElementById('agilitySelectorFill');
  const agiInfo = document.getElementById('agilityInfo');
  const agiText = document.getElementById('agilityProgressTextSidebar');
  agiSel?.classList.toggle('active', selected === 'agility');
  agiSel?.classList.toggle('running', root.activities?.agility);
  const agiPct = (root.agility.exp / root.agility.expMax) * 100;
  if (agiFill) agiFill.style.width = `${agiPct}%`;
  if (agiInfo) agiInfo.textContent = root.activities?.agility ? 'Training...' : `Level ${root.agility.level}`;
  if (agiText) agiText.textContent = `${fmt(root.agility.exp)} / ${fmt(root.agility.expMax)}`;

  // Mining
  const miningSel = document.getElementById('miningSelector');
  const miningFill = document.getElementById('miningSelectorFill');
  const miningInfo = document.getElementById('miningInfo');
  const miningText = document.getElementById('miningProgressTextSidebar');
  miningSel?.classList.toggle('active', selected === 'mining');
  miningSel?.classList.toggle('running', root.activities?.mining);
  const miningPct = (root.mining.exp / root.mining.expMax) * 100;
  if (miningFill) miningFill.style.width = `${miningPct}%`;
  if (miningInfo) miningInfo.textContent = root.activities?.mining ? 'Mining...' : `Level ${root.mining.level}`;
  if (miningText) miningText.textContent = `${fmt(root.mining.exp)} / ${fmt(root.mining.expMax)}`;

  // Gathering
  const gatheringSel = document.getElementById('gatheringSelector');
  const gatheringFill = document.getElementById('gatheringSelectorFill');
  const gatheringInfo = document.getElementById('gatheringInfo');
  const gatheringText = document.getElementById('gatheringProgressTextSidebar');
  gatheringSel?.classList.toggle('active', selected === 'gathering');
  gatheringSel?.classList.toggle('running', root.activities?.gathering);
  const gatheringPct = (root.gathering.exp / root.gathering.expMax) * 100;
  if (gatheringFill) gatheringFill.style.width = `${gatheringPct}%`;
  if (gatheringInfo) gatheringInfo.textContent = root.activities?.gathering ? 'Gathering...' : `Level ${root.gathering.level}`;
  if (gatheringText) gatheringText.textContent = `${fmt(root.gathering.exp)} / ${fmt(root.gathering.expMax)}`;

  // Catching
  const catchSel = document.getElementById('catchingSelector');
  const catchFill = document.getElementById('catchingProgressFill');
  const catchInfo = document.getElementById('catchingLevel');
  const catchText = document.getElementById('catchingProgressTextSidebar');
  catchSel?.classList.toggle('active', selected === 'catching');
  catchSel?.classList.toggle('running', root.activities?.catching);
  const catchPct = (root.catching.exp / root.catching.expMax) * 100;
  if (catchFill) catchFill.style.width = `${catchPct}%`;
  if (catchInfo) catchInfo.textContent = root.activities?.catching ? 'Catching...' : `Level ${root.catching.level}`;
  if (catchText) catchText.textContent = `${fmt(root.catching.exp)} / ${fmt(root.catching.expMax)}`;

  // Forging
  const forgeSel = document.getElementById('forgingSelector');
  const forgeFill = document.getElementById('forgingProgressFillSidebar');
  const forgeInfo = document.getElementById('forgingLevelSidebar');
  const forgeText = document.getElementById('forgingProgressTextSidebar');
  forgeSel?.classList.toggle('active', selected === 'forging');
  forgeSel?.classList.toggle('running', root.activities?.forging);
  const forgePct = (root.forging.exp / root.forging.expMax) * 100;
  if (forgeFill) forgeFill.style.width = `${forgePct}%`;
  if (forgeInfo) forgeInfo.textContent = root.activities?.forging ? 'Forging...' : `Level ${root.forging.level}`;
  if (forgeText) forgeText.textContent = `${fmt(root.forging.exp)} / ${fmt(root.forging.expMax)}`;

  // Cooking
  const cookSel = document.getElementById('cookingSelector');
  const cookFill = document.getElementById('cookingProgressFillSidebar');
  const cookInfo = document.getElementById('cookingLevelSidebar');
  const cookText = document.getElementById('cookingProgressTextSidebar');
  cookSel?.classList.toggle('active', selected === 'cooking');
  cookSel?.classList.toggle('running', root.activities?.cooking);
  const cookPct = (root.cooking.exp / root.cooking.expMax) * 100;
  if (cookFill) cookFill.style.width = `${cookPct}%`;
  if (cookInfo) cookInfo.textContent = root.activities?.cooking ? 'Cooking...' : `Level ${root.cooking.level}`;
  if (cookText) cookText.textContent = `${fmt(root.cooking.exp)} / ${fmt(root.cooking.expMax)}`;

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

  const settingsSelector = document.getElementById('settingsSelector');
  settingsSelector?.classList.toggle('active', selected === 'settings');

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

export function renderActiveActivity(root) {
  updateActivityCultivation();
  const selected = getSelectedActivity(root);
  switch (selected) {
    case 'adventure':
      updateActivityAdventure();
      break;
    case 'character':
      renderEquipmentPanel();
      break;
    case 'cooking':
      updateActivityCooking();
      break;
    // other activities intentionally no-op
  }
}
