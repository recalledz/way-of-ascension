import { combatState } from "./state.js";
import { tickAilments, tickStatuses } from "./statusEngine.js";
import { registerFeature } from "../registry.js";

export const CombatFeature = {
  key: "combat",
  initialState: () => ({ ...combatState, _v: 0 }),
  nav: {
    visible() {
      return true;
    },
  },
};

registerFeature({
  id: "combat",
  init: () => ({ ...combatState, _v: 0 }),
  tick: (state, stepMs) => {
    const dtSec = stepMs / 1000;
    tickAilments(state, dtSec, state);
    tickStatuses(state, dtSec, state);
    const enemy = state.adventure?.currentEnemy;
    if (enemy) {
      tickAilments(enemy, dtSec, state);
      tickStatuses(enemy, dtSec, state);
    }
  },
});
