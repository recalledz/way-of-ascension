import { createGameController } from "./game/GameController.js";
import { mountAllFeatureUIs } from "./features/index.js";

const game = createGameController();
mountAllFeatureUIs(game.state);
game.start();

// window.game = game; // optional for debug
