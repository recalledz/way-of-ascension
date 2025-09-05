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
import { featureFlags, devUnlockPreset } from "../config.js";
import { selectProgress, selectAstral, selectSect } from "../shared/selectors.js";
import { advanceRealm, unlockAstralNode } from "./progression/mutators.js";
import { forceBuild } from "./sect/mutators.js";


// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

const unlockMap = {
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
  proficiency: (s) => selectProgress.mortalStage(s) >= 5,
};

function applyDevUnlockPreset(state) {
  if (devUnlockPreset !== 'all') return;
  const prog = state.progression || state;
  while (selectProgress.mortalStage(prog) < 5) advanceRealm(prog);
  while (!selectProgress.isQiRefiningReached(prog)) advanceRealm(prog);
  unlockAstralNode(4060, prog);
  unlockAstralNode(4061, prog);
  unlockAstralNode(4062, prog);
  forceBuild(state, 'alchemy');
  forceBuild(state, 'kitchen');
}

export function mountAllFeatureUIs(state) {
  applyDevUnlockPreset(state);
  const vis = debugFeatureVisibility(state);
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
  for (const [key, flag] of Object.entries(featureFlags)) {
    const unlockFn = unlockMap[key] || (() => true);
    const unlockAllowed = unlockFn(state);
    const flagAllowed = !!flag;
    result[key] = {
      flagAllowed,
      unlockAllowed,
      visible: flagAllowed && unlockAllowed,
      reason: !flagAllowed ? 'flag=false' : unlockAllowed ? 'unlocked' : 'locked',
    };
  }
  return result;
}

