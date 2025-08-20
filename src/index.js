import { createGameController } from "./game/GameController.js";
import { mountProficiencyUI } from "./features/proficiency/ui/weaponProficiencyDisplay.js";

const game = createGameController();
game.start();

mountProficiencyUI(game.state);

// Optionally expose for debug:
// window.game = game;
