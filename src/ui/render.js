import { setText, setFill } from "../shared/utils/dom.js";
import { fmt } from "../shared/utils/number.js";
import { emit } from "../shared/events.js";

import { updateRealmUI } from "../features/progression/index.js";
import { updateQiAndFoundation } from "../features/progression/ui/qiDisplay.js";
import { updateCombatStats } from "../features/combat/ui/combatStats.js";
import { updateAdventureProgress } from "../features/adventure/ui/adventureDisplay.js";
import { updateResourceDisplay } from "../features/inventory/ui/resourceDisplay.js";
import { updateKarmaDisplay } from "../features/karma/ui/karmaHUD.js";
import { updateLawsUI } from "../features/progression/ui/lawsHUD.js";
import { updateCookingSidebar } from "../features/cooking/ui/cookingDisplay.js";
import { updateActivitySelectors, updateCurrentTaskDisplay } from "../features/activity/ui/activityUI.js";
import { updateActivityCultivation } from "../features/progression/index.js";
import { getSelectedActivity } from "../features/activity/selectors.js";
import { renderEquipmentPanel } from "../features/inventory/ui/CharacterPanel.js";
import { updateActivityAdventure } from "../features/adventure/logic.js";
import { updateActivityCooking } from "../features/cooking/ui/cookingDisplay.js";

export function updateAll(root) {
  updateRealmUI();
  updateQiAndFoundation();

  // HP & Shield HUD
  setText('hpVal', fmt(root.hp)); setText('hpMax', fmt(root.hpMax));
  setText('hpValL', fmt(root.hp)); setText('hpMaxL', fmt(root.hpMax));
  setFill('hpFill', root.hp / root.hpMax);
  setFill('shieldFill', root.shield?.max ? root.shield.current / root.shield.max : 0);
  updateCombatStats();

  // Activity HUD
  updateCurrentTaskDisplay(root);
  updateActivitySelectors(root);

  // Progression sidebars
  updateCookingSidebar();
  updateAdventureProgress();
  updateResourceDisplay();
  updateKarmaDisplay();
  updateLawsUI();

  // Visible activity panel refresh
  updateActivityCultivation();
  const selected = getSelectedActivity(root);
  if (selected === "adventure") updateActivityAdventure();
  if (selected === "character") renderEquipmentPanel();
  if (selected === "cooking") updateActivityCooking();

  emit('RENDER');
}
