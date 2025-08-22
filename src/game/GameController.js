import { gameTick } from "./tickRunner.js";
import { updateAll } from "../ui/render.js";

export function createGameController(state, ctx = {}) {
  const root = state;
  const controller = {};
  let paused = false;
  let speed = 1;
  let lastTs = 0;
  let acc = 0;
  const stepMs = 1000;

  function rafLoop(ts) {
    if (!lastTs) lastTs = ts;
    const rawDt = ts - lastTs; lastTs = ts;
    if (!paused) {
      acc += rawDt * speed;
      while (acc >= stepMs) {
        gameTick(root, stepMs);
        ctx.emit?.("TICK", { dt: stepMs, ts });
        acc -= stepMs;
      }
      updateAll(root);
    }
    requestAnimationFrame(rafLoop);
  }

  controller.start    = () => requestAnimationFrame(rafLoop);
  controller.pause    = () => { paused = true; };
  controller.resume   = () => { paused = false; };
  controller.step     = () => { gameTick(root, stepMs); updateAll(root); };
  controller.setSpeed = (x) => { speed = Math.max(0.1, Math.min(4, Number(x)||1)); };
  controller.getSpeed = () => speed;
  controller.emit     = (type, payload) => ctx.emit?.(type, payload);

  return controller;
}
