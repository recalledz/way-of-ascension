import { emit } from "../shared/events.js";
import { loadSave, saveDebounced } from "../shared/saveLoad.js";

// feature slices (add more as features migrate)
import { proficiencyState } from "../features/proficiency/state.js";
import { weaponGenerationState } from "../features/weaponGeneration/state.js";

// TODO: keep legacy engine until migrated
// import engineTick from "./engine.js";

export function createGameController() {
  const state = {
    app: { mode: "town", lastTick: performance.now() },
    // compose feature slices (clone to avoid sharing module singletons)
    proficiency: structuredClone(proficiencyState),
    weaponGen: structuredClone(weaponGenerationState),

    // TODO: keep legacy root pieces here until migrated (adventure, combat, etc.)
  };

  // hydrate from save
  const hydrated = loadSave(state);
  Object.assign(state, hydrated);

  let running = false;
  let acc = 0;
  const stepMs = 100; // fixed timestep

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
      // Keep legacy engine call inside while (commented until wired)
      // engineTick(state);
      emit("TICK", { stepMs, now });
      acc -= stepMs;
    }

    emit("RENDER");      // UIs should read via selectors on this pulse
    saveDebounced(state);
    requestAnimationFrame(loop);
  }

  function setMode(next) { state.app.mode = next; emit("MODE_CHANGED", next); }

  return { state, start, setMode };
}
