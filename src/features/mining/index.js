import { registerFeature } from "../registry.js";
import { miningState } from "./state.js";
import { advanceMining } from "./logic.js";
import { mountMiningUI } from "./ui/miningDisplay.js";

registerFeature({
  id: "mining",
  init: () => structuredClone(miningState),
  tick: (state) => advanceMining(state),
  mount: mountMiningUI,
});

