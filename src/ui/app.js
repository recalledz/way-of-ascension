// src/ui/app.js
import { createGameController } from "../game/GameController.js";
import { mountSidebar } from "./sidebar.js";
import { mountAllFeatureUIs } from "../features/index.js";

// If you already have a debug panel module, this import is safe;
// if not, keep it and conditionally call only if it exists.
let mountDebugUI;
try {
  ({ mountDebugUI } = await import("./debug.js"));
} catch {}

export function startApp() {
  // 1) create controller & shared ctx
  const game = createGameController();
  const ctx = { emit: game.emit };

  // 2) app-shell mounts
  try { mountSidebar?.(game.state, ctx); } catch (e) { console.warn("Sidebar mount failed:", e); }

  // TEMP bridge: mount feature UIs
  try { mountAllFeatureUIs(game.state); } catch (e) { console.warn("Feature UI mount failed:", e); }

  // 3) optional debug (dev only)
  const dev = (typeof window !== "undefined" && window.DEBUG === true)
           || (typeof import.meta !== "undefined" && import.meta?.env?.MODE === "development");
  if (dev && typeof mountDebugUI === "function") {
    try { mountDebugUI(game.state, ctx); } catch (e) { console.warn("Debug mount failed:", e); }
  }

  // 4) start loop
  game.start();

  return { game, ctx };
}

// Auto-boot in browser if this file is loaded directly
if (typeof window !== "undefined" && !window.__APP_STARTED__) {
  window.__APP_STARTED__ = true;
  try { startApp(); } catch (e) { console.error("App boot failed:", e); }
}
