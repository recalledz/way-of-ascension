import { registerFeature } from "../registry.js";
import { proficiencyState } from "./state.js";

registerFeature({
  id: "proficiency",
  init: () => structuredClone(proficiencyState),
});
