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
import { mountMindReadingUI } from "./mind/ui/mindReadingTab.js";
import { mountAstralTreeUI } from "./progression/ui/astralTree.js";
import { mountForgingUI } from "./forging/ui/forgingDisplay.js";
import { featureFlags } from "../config.js";

// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

export function mountAllFeatureUIs(state) {
  if (featureFlags.proficiency) mountProficiencyUI(state);
  if (featureFlags.sect) mountSectUI(state);
  if (featureFlags.karma) mountKarmaUI(state);
  if (featureFlags.alchemy) mountAlchemyUI(state);
  if (featureFlags.cooking) mountCookingUI(state);
  if (featureFlags.mining) mountMiningUI(state);
  if (featureFlags.gathering) mountGatheringUI(state);
  if (featureFlags.forging) mountForgingUI(state);
  if (featureFlags.physique) mountPhysiqueUI(state);
  if (featureFlags.agility) mountAgilityUI(state);
  if (featureFlags.law) mountLawDisplay(state);
  if (featureFlags.mind) mountMindReadingUI(state);
  if (featureFlags.astralTree) mountAstralTreeUI(state);

  // mountWeaponGenUI?.(state);
}

// Diagnostics helpers -------------------------------------------------
export const FEATURE_KEYS = Object.keys(featureFlags);

export function debugFeatureVisibility(key, root) {
  const flagAllowed = !!featureFlags[key];
  const unlockAllowed = true;
  const reason = flagAllowed ? 'flag=true' : 'flag=false';
  return { flagAllowed, unlockAllowed, reason };
}

export function listFeatureVisibility(root) {
  const out = {};
  for (const key of FEATURE_KEYS) out[key] = debugFeatureVisibility(key, root);
  return out;
}
