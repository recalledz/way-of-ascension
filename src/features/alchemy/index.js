import { registerFeature } from "../registry.js";
import { alchemyState } from "./state.js";
import { tickAlchemy } from "./logic.js";

registerFeature({
  id: "alchemy",
  init: () => structuredClone(alchemyState),
  tick: tickAlchemy,
});
