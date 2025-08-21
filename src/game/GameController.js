import { emit } from "../shared/events.js";
import { loadSave, saveDebounced } from "../shared/saveLoad.js";
import { recalculateBuildingBonuses } from "../features/sect/mutators.js";
import { composeInitialState, tickFeatures } from "../features/registry.js";

export function createGameController(initialState = composeInitialState()) {
  const state = initialState;

  const hydrated = loadSave(state);
  Object.assign(state, hydrated);
  recalculateBuildingBonuses(state);

  let running = false;
  let acc = 0;
  const stepMs = 100;

  function start() {
    if (running) return; running = true;
    state.app.lastTick = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(now) {
    if (!running) return;
    const dt = now - state.app.lastTick;
    state.app.lastTick = now;
    acc += dt;

    while (acc >= stepMs) {
      tickFeatures(state, stepMs);

      // --- New world: per-feature listeners advance here ---
      emit("TICK", { stepMs, now });

      acc -= stepMs;
    }

    emit("RENDER");          // UIs pull via selectors
    saveDebounced(state);    // keep autosave behaviour
    requestAnimationFrame(loop);
  }

  function setMode(next) { state.app.mode = next; emit("MODE_CHANGED", next); }

  return { state, start, setMode };
}
