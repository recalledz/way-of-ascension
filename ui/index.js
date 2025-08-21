import { registerAllFeatures, composeInitialState, registeredFeatures } from "../src/features/registry.js";
import { createGameController } from "../src/game/GameController.js";
import { emit } from "../src/shared/events.js";
import { renderSidebarActivities } from "../src/ui/sidebar.js";

async function bootstrap() {
  await registerAllFeatures();
  const initial = composeInitialState();
  const game = createGameController(initial);

  renderSidebarActivities();
  for (const feature of registeredFeatures) {
    if (typeof feature.mount === "function") {
      feature.mount(game.state, { emit });
    }
  }

  game.start();
}

bootstrap();

