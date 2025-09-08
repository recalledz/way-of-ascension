# Tutorial Flow

The game includes a simple tutorial that guides new players through the opening steps of cultivation.

1. **Start cultivating** – toggle the cultivation activity.
2. **Gain foundation** – accumulate any amount of foundation.
3. **Attempt a breakthrough** – begin a breakthrough once ready.
4. **Purchase a notable astral tree node** – spend Insight on one of the larger nodes to unlock Adventure and choose a starting weapon.

The current progress is stored in `state.tutorial.step` and `state.tutorial.completed`.

To disable the tutorial, set `state.tutorial.completed = true` in the console.
To restart, set `state.tutorial = { step: 0, completed: false }` or call `resetTutorial(state)` from `src/features/tutorial/logic.js`.
