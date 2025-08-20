// src/features/index.js
// Add feature UI mounts here as features migrate.

import { mountProficiencyUI } from "./proficiency/ui/weaponProficiencyDisplay.js";
// If/when present:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

export function mountAllFeatureUIs(state) {
  // Mount order can matter if some UIs depend on global elements;
  // keep it deterministic.
  mountProficiencyUI(state);
  // mountWeaponGenUI?.(state);
}
