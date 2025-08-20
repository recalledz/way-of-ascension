import { registerFeature } from "../registry.js";
import { weaponGenerationState } from "./state.js";

registerFeature({
  id: "weaponGen",
  init: () => structuredClone(weaponGenerationState),
});
