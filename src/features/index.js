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
import { featureFlags } from "../config.js";
import { selectProgress, selectAstral, selectSect } from "../shared/selectors.js";


// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

const unlockFns = {
  astralTree: (s) => selectProgress.mortalStage(s) >= 2,
  mining: (s) => selectAstral.isNodeUnlocked(4060, s),
  physique: (s) => selectAstral.isNodeUnlocked(4060, s),
  gathering: (s) => selectAstral.isNodeUnlocked(4061, s),
  mind: (s) => selectAstral.isNodeUnlocked(4061, s),
  catching: (s) => selectAstral.isNodeUnlocked(4062, s),
  agility: (s) => selectAstral.isNodeUnlocked(4062, s),
  alchemy: (s) => selectSect.isBuildingBuilt('alchemy', s),
  cooking: (s) => selectSect.isBuildingBuilt('kitchen', s),
  law: (s) => selectProgress.isQiRefiningReached(s),
  sect: (s) => selectProgress.mortalStage(s) >= 3,
  adventure: (s) => selectProgress.mortalStage(s) >= 5,
  proficiency: (s) => selectProgress.mortalStage(s) >= 5,
};

export function isFeatureVisible(key, state) {
  const flagAllowed = !!featureFlags[key];
  const unlockAllowed = unlockFns[key] ? unlockFns[key](state) : true;
  return { flagAllowed, unlockAllowed, visible: flagAllowed && unlockAllowed };
}

export function mountAllFeatureUIs(state) {
  if (isFeatureVisible('proficiency', state).visible) mountProficiencyUI(state);
  if (isFeatureVisible('sect', state).visible) mountSectUI(state);
  if (isFeatureVisible('karma', state).visible) mountKarmaUI(state);
  if (isFeatureVisible('alchemy', state).visible) mountAlchemyUI(state);
  if (isFeatureVisible('cooking', state).visible) mountCookingUI(state);
  if (isFeatureVisible('mining', state).visible) mountMiningUI(state);
  if (isFeatureVisible('gathering', state).visible) mountGatheringUI(state);
  if (isFeatureVisible('forging', state).visible) mountForgingUI(state);
  if (isFeatureVisible('physique', state).visible) mountPhysiqueUI(state);
  if (isFeatureVisible('agility', state).visible) mountAgilityUI(state);
  if (isFeatureVisible('catching', state).visible) mountCatchingUI(state);
  if (isFeatureVisible('law', state).visible) mountLawDisplay(state);
  if (isFeatureVisible('mind', state).visible) mountMindReadingUI(state);
  if (isFeatureVisible('astralTree', state).visible) mountAstralTreeUI(state);

  // mountWeaponGenUI?.(state);
}

export function debugFeatureVisibility(state) {
  const result = {};
  for (const key of Object.keys(featureFlags)) {
    const info = isFeatureVisible(key, state);
    result[key] = {
      ...info,
      reason: !info.flagAllowed ? 'flag=false' : !info.unlockAllowed ? 'unlock=false' : 'ok',
    };
  }
  return result;
}

