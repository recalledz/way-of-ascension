// src/features/index.js
// Add feature UI mounts here as features migrate.

import { mountProficiencyUI } from "./proficiency/ui/weaponProficiencyDisplay.js";
import { mountSectUI } from "./sect/ui/sectScreen.js";
import { mountKarmaUI } from "./karma/ui/karmaDisplay.js";
import { mountAlchemyUI } from "./alchemy/ui/alchemyDisplay.js";
import { mountCookingUI } from "./cooking/ui/cookingDisplay.js";
import { mountLawDisplay } from "./progression/ui/lawDisplay.js";
import { mountMiningUI } from "./mining/ui/miningDisplay.js";
import { mountGatheringUI } from "./gathering/ui/gatheringDisplay.js";
import { mountPhysiqueUI } from "./physique/ui/physiqueDisplay.js";
import { mountAgilityUI } from "./agility/ui/agilityDisplay.js";
import { mountCatchingUI } from "./catching/ui/catchingDisplay.js";
import { mountMindReadingUI } from "./mind/ui/mindReadingTab.js";
import { mountAstralTreeUI } from "./progression/ui/astralTree.js";
import { mountForgingUI } from "./forging/ui/forgingDisplay.js";
import { mountTrainingGameUI as mountPhysiqueTrainingUI } from "./physique/ui/trainingGame.js";
import { mountAgilityTrainingUI } from "./agility/ui/trainingGame.js";
import { mountCultivationSidebar } from "./progression/ui/cultivationSidebar.js";
import { featureFlags, devUnlockPreset } from "../config.js";
import { selectProgress, selectAstral, selectSect } from "../shared/selectors.js";
import { applyDevUnlockPreset } from "./devUnlock.js";


// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

const unlockMap = {
  astralTree: (s) => selectProgress.realmStage(s) >= 2,
  mining: (s) => selectAstral.isNodeUnlocked(4060, s),
  physique: (s) => selectAstral.isNodeUnlocked(4060, s),
  gathering: (s) => selectAstral.isNodeUnlocked(4061, s),
  mind: (s) => selectAstral.isNodeUnlocked(4061, s),
  catching: (s) => selectAstral.isNodeUnlocked(4062, s),
  agility: (s) => selectAstral.isNodeUnlocked(4062, s),
  forging: (s) => selectAstral.isNodeUnlocked(4062, s),
  alchemy: (s) => selectSect.isBuildingBuilt('alchemy', s),
  cooking: (s) => selectSect.isBuildingBuilt('kitchen', s),
  law: (s) => selectProgress.isQiRefiningReached(s),
  sect: (s) => selectProgress.mortalStage(s) >= 3,
  adventure: (s) => selectProgress.mortalStage(s) >= 5,
  proficiency: (s) => selectProgress.mortalStage(s) >= 5,
};

const coreFeatures = new Set([
  'astralTree',
  'mining',
  'physique',
  'gathering',
  'mind',
  'forging',
  'agility',
  'alchemy',
  'cooking',
  'law',
  'sect',
  'adventure',
  'proficiency',
]);

export function mountAllFeatureUIs(state) {
  applyDevUnlockPreset(state);
  if (devUnlockPreset === 'all') {
    mountCultivationSidebar(state);
    mountProficiencyUI(state);
    mountSectUI(state);
    mountKarmaUI(state);
    mountAlchemyUI(state);
    mountCookingUI(state);
    mountMiningUI(state);
    mountGatheringUI(state);
    mountForgingUI(state);
    mountPhysiqueUI(state);
    mountPhysiqueTrainingUI(state);
    mountAgilityUI(state);
    mountAgilityTrainingUI(state);
    mountCatchingUI(state);
    mountLawDisplay(state);
    mountMindReadingUI(state);
    mountAstralTreeUI(state);
    const ensure = (containerId, id, activity, label) => {
      const container = document.getElementById(containerId);
      if (!container || document.getElementById(id)) return;
      const item = document.createElement('div');
      item.className = containerId === 'levelingActivities' ? 'activity-item leveling-tab' : 'activity-item management-tab';
      item.id = id;
      item.dataset.activity = activity;
      item.innerHTML = `<div class="activity-name">${label}</div>`;
      container.appendChild(item);
    };

    ensure('levelingActivities', 'physiqueSelector', 'physique', 'Physique');
    ensure('levelingActivities', 'agilitySelector', 'agility', 'Agility');
    ensure('levelingActivities', 'miningSelector', 'mining', 'Mining');
    ensure('levelingActivities', 'gatheringSelector', 'gathering', 'Gathering');
    ensure('levelingActivities', 'forgingSelector', 'forging', 'Forging');
    ensure('levelingActivities', 'catchingSelector', 'catching', 'Catching');
    ensure('managementActivities', 'adventureSelector', 'adventure', 'Adventure');
    ensure('managementActivities', 'cookingSelector', 'cooking', 'Cooking');
    ensure('managementActivities', 'alchemySelector', 'alchemy', 'Alchemy');
    return;
  }
  const vis = debugFeatureVisibility(state);
  if (vis.cultivation?.visible) mountCultivationSidebar(state);
  if (vis.proficiency.visible) mountProficiencyUI(state);
  if (vis.sect.visible) mountSectUI(state);
  if (vis.karma.visible) mountKarmaUI(state);
  if (vis.alchemy.visible) mountAlchemyUI(state);
  if (vis.cooking.visible) mountCookingUI(state);
  if (vis.mining.visible) mountMiningUI(state);
  if (vis.gathering.visible) mountGatheringUI(state);
  if (vis.forging.visible) mountForgingUI(state);
  if (vis.physique.visible) {
    mountPhysiqueUI(state);
    mountPhysiqueTrainingUI(state);
  }
  if (vis.agility.visible) {
    mountAgilityUI(state);
    mountAgilityTrainingUI(state);
  }
  if (vis.catching.visible) mountCatchingUI(state);
  if (vis.law.visible) mountLawDisplay(state);
  if (vis.mind.visible) mountMindReadingUI(state);
  if (vis.astralTree.visible) mountAstralTreeUI(state);

  // mountWeaponGenUI?.(state);
}

export function debugFeatureVisibility(state) {
  const result = {};
  const keys = new Set([
    ...Object.keys(featureFlags),
    ...Object.keys(unlockMap),
  ]);
  if (devUnlockPreset === 'all') {
    for (const key of keys) {
      result[key] = { visible: true };
    }
    return result;
  }
  for (const key of keys) {
    const unlockFn = unlockMap[key] || (() => true);
    const unlockAllowed = unlockFn(state);
    if (coreFeatures.has(key)) {
      result[key] = {
        unlockAllowed,
        visible: unlockAllowed,
      };
    } else {
      const hasFlag = Object.prototype.hasOwnProperty.call(featureFlags, key);
      const flagActive = hasFlag ? !!featureFlags[key] : true;
      result[key] = {
        flagAllowed: hasFlag ? flagActive : undefined,
        unlockAllowed,
        visible: flagActive && unlockAllowed,
      };
    }
  }
  return result;
}

