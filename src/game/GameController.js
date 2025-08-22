import { gameTick } from "./tickRunner.js";
import { updateAll } from "../ui/render.js";

export function createGameController(state, ctx = {}) {
  const root = state;
  const controller = {};
  let paused = false;
  let speed = 1;
  let lastTs = 0;

  function rafLoop(ts) {
    if (!lastTs) lastTs = ts;
    const rawDt = ts - lastTs; lastTs = ts;
    if (!paused) {
      const scaledDt = Math.max(16, rawDt * speed); // clamp to ~60fps min step
      gameTick(root, scaledDt);
      updateAll(root);
      ctx.emit?.("TICK", { dt: scaledDt, ts });
    }
    requestAnimationFrame(rafLoop);
  }

  controller.start    = () => requestAnimationFrame(rafLoop);
  controller.pause    = () => { paused = true; };
  controller.resume   = () => { paused = false; };
  controller.step     = () => { const dt = 100; gameTick(root, dt); updateAll(root); };
  controller.setSpeed = (x) => { speed = Math.max(0.1, Math.min(4, Number(x)||1)); };
  controller.getSpeed = () => speed;
  controller.emit     = (type, payload) => ctx.emit?.(type, payload);

  return controller;
}
