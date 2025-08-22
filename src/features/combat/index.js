import { combatState } from "./state.js";

export const CombatFeature = {
  key: "combat",
  initialState: () => ({ ...combatState, _v: 0 }),
};
