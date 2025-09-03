import { combatState } from "./state.js";
import { tickAilments } from "./statusEngine.js";
import { registerFeature } from "../registry.js";

export const CombatFeature = {
  key: "combat",
  initialState: () => ({ ...combatState, _v: 0 }),
};

registerFeature({
  id: "combat",
  init: () => ({ ...combatState, _v: 0 }),
  tick: (state, stepMs) => {
    const dtSec = stepMs / 1000;
    tickAilments(state, dtSec, state);
    const enemy = state.adventure?.currentEnemy;
    if (enemy) tickAilments(enemy, dtSec, state);
  },
});
