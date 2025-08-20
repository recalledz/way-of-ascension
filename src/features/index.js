// src/features/index.js
// Add feature UI mounts here as features migrate.

import { mountProficiencyUI } from "./proficiency/ui/weaponProficiencyDisplay.js";
// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

export function mountAllFeatureUIs(state) {
  mountProficiencyUI(state);
  // mountWeaponGenUI?.(state);
}

