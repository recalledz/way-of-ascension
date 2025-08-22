import { createGameController } from "./game/GameController.js";
import { mountAllFeatureUIs } from "./features/index.js";
import { mountDevQuickMenu } from "./ui/dev/devQuickMenu.js";

const game = createGameController();
mountAllFeatureUIs(game.state);
game.start();

// window.game = game; // optional for debugging

// Expose hooks for the dev menu if needed
window.__PAUSE = () => game.pause();
window.__RESUME = () => game.resume();
window.__STEP = () => game.step();
window.__GET_SPEED = () => game.getSpeed();
window.__SET_SPEED = (v) => game.setSpeed(v);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mountDevQuickMenu());
} else {
  mountDevQuickMenu();
}
