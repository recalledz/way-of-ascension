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
import { featureFlags, devUnlockPreset } from "../config.js";
import { selectProgress, selectAstral, selectSect } from "../shared/selectors/index.js";
import { advanceRealm } from "./progression/mutators.js";
import { upgradeBuilding } from "./sect/mutators.js";
import { unlockAstralNode } from "./progression/astral.js";


// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

const unlockRules = {
  adventure: (root) => selectProgress.mortalStage(root) >= 5,
  proficiency: (root) => selectProgress.mortalStage(root) >= 5,
  sect: (root) => selectProgress.mortalStage(root) >= 3,
  alchemy: (root) => selectSect.isBuildingBuilt('alchemy', root),
  cooking: (root) => selectSect.isBuildingBuilt('kitchen', root),
  mining: () => selectAstral.isNodeUnlocked(4060),
  physique: () => selectAstral.isNodeUnlocked(4060),
  gathering: () => selectAstral.isNodeUnlocked(4061),
  mind: () => selectAstral.isNodeUnlocked(4061),
  catching: () => selectAstral.isNodeUnlocked(4062),
  agility: () => selectAstral.isNodeUnlocked(4062),
  law: (root) => selectProgress.isQiRefiningReached(root),
  astralTree: (root) => selectProgress.mortalStage(root) >= 2,
  forging: () => true,
  karma: () => true,
};

const featureMounts = {
  proficiency: mountProficiencyUI,
  sect: mountSectUI,
  karma: mountKarmaUI,
  alchemy: mountAlchemyUI,
  cooking: mountCookingUI,
  mining: mountMiningUI,
  gathering: mountGatheringUI,
  forging: mountForgingUI,
  physique: mountPhysiqueUI,
  agility: mountAgilityUI,
  catching: mountCatchingUI,
  law: mountLawDisplay,
  mind: mountMindReadingUI,
  astralTree: mountAstralTreeUI,
};

function applyDevUnlockPreset(state) {
  if (devUnlockPreset !== 'all') return;
  for (let i = 0; i < 10; i++) advanceRealm(state);
  state.stones = (state.stones || 0) + 1000;
  state.wood = (state.wood || 0) + 1000;
  state.ore = (state.ore || 0) + 1000;
  state.herbs = (state.herbs || 0) + 1000;
  upgradeBuilding(state, 'kitchen');
  upgradeBuilding(state, 'alchemy_lab');
  unlockAstralNode(4060);
  unlockAstralNode(4061);
  unlockAstralNode(4062);
}

export function mountAllFeatureUIs(state) {
  applyDevUnlockPreset(state);
  for (const [key, flag] of Object.entries(featureFlags)) {
    const unlock = unlockRules[key] || (() => true);
    if (flag && unlock(state)) {
      featureMounts[key]?.(state);
    }
  }
}

export function debugFeatureVisibility(state) {
  const result = {};
  for (const [key, flag] of Object.entries(featureFlags)) {
    const unlock = unlockRules[key] || (() => true);
    const flagAllowed = !!flag;
    const unlockAllowed = unlock(state);
    result[key] = {
      flagAllowed,
      unlockAllowed,
      visible: flagAllowed && unlockAllowed,
      reason: !flagAllowed ? 'flag=false' : unlockAllowed ? 'visible' : 'unlock=false'
    };
  }
  return result;
}

