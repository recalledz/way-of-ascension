import { abilityState } from "./state.js";
import { tickAbility } from "./mutators.js";
import { registerFeature } from "../registry.js";

export const AbilityFeature = {
  key: "ability",
  initialState: () => ({ ...abilityState, _v: 0 }),
};

registerFeature({
  id: AbilityFeature.key,
  init: AbilityFeature.initialState,
  tick: tickAbility,
});
