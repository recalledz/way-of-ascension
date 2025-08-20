import { emit } from "../shared/events.js";
import { loadSave, saveDebounced } from "../shared/saveLoad.js";

// feature slices
import { proficiencyState } from "../features/proficiency/state.js";
import { weaponGenerationState } from "../features/weaponGeneration/state.js";

// TEMP bridge to legacy world:
import engineTick from "./engine.js";

export function createGameController() {
  const state = {
    app: { mode: "town", lastTick: performance.now() },
    proficiency: structuredClone(proficiencyState),
    weaponGen: structuredClone(weaponGenerationState),
    // legacy root pieces remain attached to `state` until migrated
  };

  const hydrated = loadSave(state);
  Object.assign(state, hydrated);

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
      // --- TEMP BRIDGE: keep legacy world advancing ---
      engineTick(state);

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
