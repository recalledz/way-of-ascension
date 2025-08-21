import { registerFeature } from "../registry.js";
import { alchemyState } from "./state.js";
import { tickAlchemy } from "./logic.js";
import { mountAlchemyUI } from "./ui/alchemyDisplay.js";

registerFeature({
  id: "alchemy",
  init: () => structuredClone(alchemyState),
  tick: tickAlchemy,
  mount: mountAlchemyUI,
});
