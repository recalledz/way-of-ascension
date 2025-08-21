import { registerAllFeatures, composeInitialState, registeredFeatures } from "./features/registry.js";
import { createGameController } from "./game/GameController.js";
import { emit } from "./shared/events.js";
import { renderSidebarActivities } from "./ui/sidebar.js";

async function bootstrap() {
  await registerAllFeatures();
  const game = createGameController(composeInitialState());
  renderSidebarActivities();
  for (const f of registeredFeatures) {
    f.mount?.(game.state, { emit });
  }
  game.start();
}

bootstrap();

// window.game = game; // optional for debugging
