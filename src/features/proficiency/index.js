import { registerFeature } from "../registry.js";
import { proficiencyState } from "./state.js";
import { mountProficiencyUI } from "./ui/weaponProficiencyDisplay.js";

registerFeature({
  id: "proficiency",
  init: () => structuredClone(proficiencyState),
  mount: mountProficiencyUI,
});
