import { registerFeature } from "../registry.js";
import { karmaState } from "./state.js";
import { mountKarmaUI } from "./ui/karmaDisplay.js";

registerFeature({
  id: "karma",
  init: () => structuredClone(karmaState),
  mount: mountKarmaUI,
});

