import { createGameController } from "./game/GameController.js";
import { mountAllFeatureUIs } from "./features/index.js";
import { mountDevQuickMenu } from "./ui/dev/devQuickMenu.js";

const game = createGameController();
mountAllFeatureUIs(game.state);
game.start();

// window.game = game; // optional for debugging

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => mountDevQuickMenu());
} else {
  mountDevQuickMenu();
}
