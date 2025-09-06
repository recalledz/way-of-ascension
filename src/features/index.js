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
import { configReport, devUnlockPreset } from "../config.js";
import { selectProgress, selectAstral, selectSect } from "../shared/selectors.js";
import { applyDevUnlockPreset } from "./devUnlock.js";
import { tickAbilityCooldowns } from "./ability/mutators.js";
import { clamp, qCap, qiRegenPerSec, fCap, foundationGainPerSec } from "./progression/selectors.js";
import { refillShieldFromQi } from "./combat/logic.js";
import { advanceMining } from "./mining/logic.js";
import { advanceGathering } from "./gathering/logic.js";
import { advanceForging } from "./forging/logic.js";
import { advanceCatching } from "./catching/logic.js";
import { tickPhysiqueTraining } from "./physique/mutators.js";
import { tickAgilityTraining } from "./agility/mutators.js";
import { isAutoMeditate, isAutoAdventure } from "./automation/selectors.js";
import { startActivity } from "./activity/mutators.js";
import { tickInsight } from "./progression/insight.js";
import { updateBreakthrough } from "./progression/index.js";
import { updateAdventureCombat } from "./adventure/logic.js";
import { onTick as mindOnTick } from "./mind/index.js";
import { log } from "../shared/utils/dom.js";
import { mountTutorialBox } from "../ui/tutorialBox.js";


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
  'character',
]);

const activityMeta = {
  physique: {
    icon: 'mdi:arm-flex',
    infoId: 'physiqueInfo',
    fillId: 'physiqueSelectorFill',
    textId: 'physiqueProgressTextSidebar'
  },
  agility: {
    icon: 'mdi:run-fast',
    infoId: 'agilityInfo',
    fillId: 'agilitySelectorFill',
    textId: 'agilityProgressTextSidebar'
  },
  mining: {
    icon: 'mdi:pickaxe',
    infoId: 'miningInfo',
    fillId: 'miningSelectorFill',
    textId: 'miningProgressText'
  },
  gathering: {
    icon: 'mdi:leaf',
    infoId: 'gatheringInfo',
    fillId: 'gatheringSelectorFill',
    textId: 'gatheringProgressText'
  },
  forging: {
    icon: 'mdi:anvil',
    infoId: 'forgingLevelSidebar',
    fillId: 'forgingProgressFillSidebar',
    textId: 'forgingProgressTextSidebar'
  },
  catching: {
    icon: 'mdi:butterfly-outline',
    infoId: 'catchingLevel',
    fillId: 'catchingProgressFill',
    textId: 'catchingProgressTextSidebar'
  },
  adventure: { icon: 'mdi:map', infoId: 'adventureInfo' },
  cooking: {
    icon: 'mdi:chef-hat',
    infoId: 'cookingLevelSidebar',
    fillId: 'cookingProgressFillSidebar',
    textId: 'cookingProgressTextSidebar'
  },
  alchemy: { icon: 'mdi:flask-round-bottom' },
  character: { icon: 'mdi:account' },
};

export function mountAllFeatureUIs(state) {
  applyDevUnlockPreset(state);
  mountTutorialBox(state);
  const { flags } = configReport();
  const ensure = (containerId, id, activity, label) => {
    const container = document.getElementById(containerId);
    if (!container || document.getElementById(id)) return;
    const meta = activityMeta[activity] || {};
    const item = document.createElement('div');
    item.className = containerId === 'levelingActivities' ? 'activity-item leveling-tab' : 'activity-item management-tab';
    item.id = id;
    item.dataset.activity = activity;
    const iconHTML = meta.icon ? `<iconify-icon icon="${meta.icon}" class="ui-icon"></iconify-icon>` : '';
    const levelHTML = meta.infoId ? `<div class="activity-level" id="${meta.infoId}"></div>` : '';
    const progressFill = meta.fillId ? `<div class="progress-fill" id="${meta.fillId}"></div>` : '';
    const progressText = meta.textId ? `<div class="progress-text" id="${meta.textId}"></div>` : '';
    const progressHTML = meta.fillId ? `<div class="activity-progress-bar">${progressFill}${progressText}</div>` : '';
    item.innerHTML = `
      <div class="activity-header">
        <div class="activity-icon">${iconHTML}</div>
        <div class="activity-info">
          <div class="activity-name">${label}</div>
          ${levelHTML}
        </div>
      </div>
      ${progressHTML}
    `;
    container.appendChild(item);
  };

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
    ensure('managementActivities', 'characterSelector', 'character', 'Character');
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
  if (vis.character?.visible) ensure('managementActivities', 'characterSelector', 'character', 'Character');
  if (vis.cultivation?.visible) mountCultivationSidebar(state);
  if (flags.FEATURE_PROFICIENCY?.parsedValue && vis.proficiency.visible) mountProficiencyUI(state);
  if (flags.FEATURE_SECT?.parsedValue && vis.sect.visible) mountSectUI(state);
  if (flags.FEATURE_KARMA?.parsedValue && vis.karma.visible) mountKarmaUI(state);
  if (flags.FEATURE_ALCHEMY?.parsedValue && vis.alchemy.visible) mountAlchemyUI(state);
  if (flags.FEATURE_COOKING?.parsedValue && vis.cooking.visible) mountCookingUI(state);
  if (flags.FEATURE_MINING?.parsedValue && vis.mining.visible) mountMiningUI(state);
  if (flags.FEATURE_GATHERING?.parsedValue && vis.gathering.visible) mountGatheringUI(state);
  if (flags.FEATURE_FORGING?.parsedValue && vis.forging.visible) mountForgingUI(state);
  if (flags.FEATURE_PHYSIQUE?.parsedValue && vis.physique.visible) {
    mountPhysiqueUI(state);
    mountPhysiqueTrainingUI(state);
  }
  if (flags.FEATURE_AGILITY?.parsedValue && vis.agility.visible) {
    mountAgilityUI(state);
    mountAgilityTrainingUI(state);
  }
  if (flags.FEATURE_CATCHING?.parsedValue && vis.catching.visible) mountCatchingUI(state);
  if (flags.FEATURE_LAW?.parsedValue && vis.law.visible) mountLawDisplay(state);
  if (flags.FEATURE_MIND?.parsedValue && vis.mind.visible) mountMindReadingUI(state);
  if (vis.astralTree.visible) mountAstralTreeUI(state);

  // mountWeaponGenUI?.(state);
}

export function debugFeatureVisibility(state) {
  const { flags } = configReport();
  const cfgFeatureFlags = {
    cultivation: true,
    proficiency: flags.FEATURE_PROFICIENCY?.parsedValue,
    sect: flags.FEATURE_SECT?.parsedValue,
    karma: flags.FEATURE_KARMA?.parsedValue,
    alchemy: flags.FEATURE_ALCHEMY?.parsedValue,
    cooking: flags.FEATURE_COOKING?.parsedValue,
    mining: flags.FEATURE_MINING?.parsedValue,
    gathering: flags.FEATURE_GATHERING?.parsedValue,
    forging: flags.FEATURE_FORGING?.parsedValue,
    physique: flags.FEATURE_PHYSIQUE?.parsedValue,
    agility: flags.FEATURE_AGILITY?.parsedValue,
    catching: flags.FEATURE_CATCHING?.parsedValue,
    law: flags.FEATURE_LAW?.parsedValue,
    mind: flags.FEATURE_MIND?.parsedValue,
    character: true,
  };
  const result = {};
  const keys = new Set([
    ...Object.keys(cfgFeatureFlags),
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
      const hasFlag = Object.prototype.hasOwnProperty.call(cfgFeatureFlags, key);
      const flagActive = hasFlag ? !!cfgFeatureFlags[key] : true;
      result[key] = {
        flagAllowed: hasFlag ? flagActive : undefined,
        unlockAllowed,
        visible: flagActive && unlockAllowed,
      };
    }
  }
  return result;
}

export function runAllFeatureTicks(state, stepMs) {
  const stepSec = stepMs / 1000;
  tickAbilityCooldowns(stepMs);
  mindOnTick(state, stepSec);

  state.qi = clamp(state.qi + qiRegenPerSec(state) * stepSec, 0, qCap(state));
  if (!(state.adventure?.inCombat)) {
    state.hp = clamp(state.hp + stepSec, 0, state.hpMax);
    if (state.adventure) state.adventure.playerHP = state.hp;
    const { gained, qiSpent } = refillShieldFromQi(state);
    if (gained > 0) log(`Your Qi reforms ${gained} shield (${qiSpent.toFixed(1)} Qi).`);
  }

  if (state.activities.cultivation) {
    const gain = foundationGainPerSec(state) * stepSec;
    state.foundation = clamp(state.foundation + gain, 0, fCap(state));
  }

  advanceMining(state);
  advanceGathering(state);
  advanceForging(state);
  advanceCatching(state);

  const physSessionEnd = tickPhysiqueTraining(state);
  if (physSessionEnd) {
    let msg = `Training session complete! ${physSessionEnd.hits} hits for ${physSessionEnd.xp} XP`;
    if (physSessionEnd.qiRecovered) {
      msg += ` and recovered ${physSessionEnd.qiRecovered.toFixed(0)} Qi`;
    }
    log(msg, 'good');
  }

  const agiSessionEnd = tickAgilityTraining(state);
  if (agiSessionEnd) {
    const msg = `Agility session complete! ${agiSessionEnd.hits} hits for ${agiSessionEnd.xp} XP`;
    log(msg, 'good');
  }

  if (isAutoMeditate() && Object.values(state.activities).every(a => !a)) {
    const gain = foundationGainPerSec(state) * stepSec * 0.5;
    state.foundation = clamp(state.foundation + gain, 0, fCap(state));
  }
  if (isAutoAdventure() && !state.activities.adventure) {
    startActivity(state, 'adventure');
  }

  tickInsight(state, stepSec);

  updateBreakthrough();

  if (state.activities.adventure && state.adventure && state.adventure.inCombat) {
    updateAdventureCombat();
  }
}

