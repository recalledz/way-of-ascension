// src/features/index.js
// Add feature UI mounts here as features migrate.

import { mountProficiencyUI } from "./proficiency/ui/weaponProficiencyDisplay.js";
import { mountSectUI } from "./sect/ui/sectScreen.js";
import { mountAlchemyUI } from "./alchemy/ui/alchemyDisplay.js";
// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

export function mountAllFeatureUIs(state) {
  mountProficiencyUI(state);
  mountSectUI(state);
  mountAlchemyUI(state);
  // mountWeaponGenUI?.(state);
}

