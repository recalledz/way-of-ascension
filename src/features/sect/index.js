import { registerFeature } from "../registry.js";
import { sectState } from "./state.js";
import { mountSectUI } from "./ui/sectScreen.js";

registerFeature({
  id: "sect",
  init: () => structuredClone(sectState),
  mount: mountSectUI,
});
