import { createGameController } from "../game/GameController.js";
import { mountAllFeatureUIs } from "../features/index.js";
import { mountDevQuickMenu } from "./dev/devQuickMenu.js";
import { mountBalanceTuner, ENABLE_BALANCE_TUNER } from "./dev/balanceTuner.js";

// Bootstraps the game controller, mounts feature UIs and starts the loop.
export function initApp() {
  const game = createGameController();
  mountAllFeatureUIs(game.state);
  game.start();

  // window.game = game; // optional for debugging

  window.__PAUSE = () => game.pause();
  window.__RESUME = () => game.resume();
  window.__STEP = () => game.step();
  window.__GET_SPEED = () => game.getSpeed();
  window.__SET_SPEED = (v) => game.setSpeed(v);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      mountDevQuickMenu();
      if (ENABLE_BALANCE_TUNER) mountBalanceTuner();
    });
  } else {
    mountDevQuickMenu();
    if (ENABLE_BALANCE_TUNER) mountBalanceTuner();
  }
}

