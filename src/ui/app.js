// src/ui/app.js
import { createGameController } from "../game/GameController.js";
import { registerAllFeatures, FEATURES } from "../features/registry.js";
import { mountSidebar } from "./sidebar.js";

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

  // 2) register features (fills FEATURES; some features may mount their own UI in init)
  registerAllFeatures();

  // 3) app-shell mounts
  try { mountSidebar?.(game.state, ctx); } catch (e) { console.warn("Sidebar mount failed:", e); }

  // TEMP bridge: call feature-provided mounts (until all features use init())
  for (const f of FEATURES) {
    try { f.mount?.(game.state, ctx); } catch (e) { console.warn(`Mount failed for feature ${f.key}:`, e); }
  }

  // 4) optional debug (dev only)
  const dev = (typeof window !== "undefined" && window.DEBUG === true)
           || (typeof import !== "undefined" && import.meta?.env?.MODE === "development");
  if (dev && typeof mountDebugUI === "function") {
    try { mountDebugUI(game.state, ctx); } catch (e) { console.warn("Debug mount failed:", e); }
  }

  // 5) start loop
  game.start();

  return { game, ctx };
}

// Auto-boot in browser if this file is loaded directly
if (typeof window !== "undefined" && !window.__APP_STARTED__) {
  window.__APP_STARTED__ = true;
  try { startApp(); } catch (e) { console.error("App boot failed:", e); }
}

