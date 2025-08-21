import { registerFeature } from "../registry.js";
import { cookingState } from "./state.js";
import { mountCookingUI } from "./ui/cookingDisplay.js";

registerFeature({
  id: "cooking",
  init: () => structuredClone(cookingState),
  mount: mountCookingUI,
});

