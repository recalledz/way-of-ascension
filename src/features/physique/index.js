import { registerFeature } from "../registry.js";
import { physiqueState } from "./state.js";
import { mountPhysiqueUI } from "./ui/physiqueDisplay.js";

registerFeature({
  id: "physique",
  init: () => structuredClone(physiqueState),
  mount: mountPhysiqueUI,
});

