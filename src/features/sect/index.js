import { registerFeature } from "../registry.js";
import { sectState } from "./state.js";

registerFeature({
  id: "sect",
  init: () => structuredClone(sectState),
});
