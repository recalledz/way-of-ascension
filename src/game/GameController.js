import { emit } from "../shared/events.js";
import { loadSave, saveDebounced } from "../shared/saveLoad.js";
import { recalculateBuildingBonuses } from "../features/sect/mutators.js";
import { initFeatureState, tickFeatures } from "../features/registry.js";

// Register feature hooks
import "../features/proficiency/index.js";
import "../features/weaponGeneration/index.js";
import "../features/sect/index.js";
import "../features/alchemy/index.js";

export function createGameController() {
  const state = {
    app: { mode: "town", lastTick: performance.now() },
    ...initFeatureState(),
    // legacy root pieces remain attached to `state` until migrated
  };

  const hydrated = loadSave(state);
  Object.assign(state, hydrated);
  recalculateBuildingBonuses(state);

  let running = false;
  let acc = 0;
  const stepMs = 100;
  let speed = 1;

  function start() {
    if (running) return; running = true;
    state.app.lastTick = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(now) {
    if (!running) return;
    const dt = now - state.app.lastTick;
    state.app.lastTick = now;
    acc += dt * speed;

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

  function pause() { running = false; }
  function resume() { if (!running) { running = true; state.app.lastTick = performance.now(); requestAnimationFrame(loop); } }
  function step() {
    tickFeatures(state, stepMs);
    emit("TICK", { stepMs, now: performance.now() });
    emit("RENDER");
    saveDebounced(state);
  }
  function getSpeed() { return speed; }
  function setSpeed(v) { speed = Number(v) || 1; }

  function setMode(next) { state.app.mode = next; emit("MODE_CHANGED", next); }

  return { state, start, setMode, pause, resume, step, getSpeed, setSpeed };
}
