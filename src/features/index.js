// src/features/index.js
// Add feature UI mounts here as features migrate.

import { mountProficiencyUI } from "./proficiency/ui/weaponProficiencyDisplay.js";
import { mountSectUI } from "./sect/ui/sectScreen.js";
import { mountKarmaUI } from "./karma/ui/karmaDisplay.js";
import { mountAlchemyUI } from "./alchemy/ui/alchemyDisplay.js";
import { mountCookingUI } from "./cooking/ui/cookingDisplay.js";

// Example placeholder for later:
// import { mountWeaponGenUI } from "./weaponGeneration/ui/weaponGenerationDisplay.js";

export function mountAllFeatureUIs(state) {
  mountProficiencyUI(state);
  mountSectUI(state);
  mountKarmaUI(state);
  mountAlchemyUI(state);
  mountCookingUI(state);
  // mountWeaponGenUI?.(state);
}

