// src/features/index.js
// Add feature UI mounts here as features migrate.

import { mountProficiencyUI } from "./proficiency/ui/weaponProficiencyDisplay.js";
import { mountAlchemyUI } from "./alchemy/ui/brewPanel.js";
import "./alchemy/logic.js";
// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

export function mountAllFeatureUIs(state) {
  mountProficiencyUI(state);
  mountAlchemyUI(state);
  // mountWeaponGenUI?.(state);
}

