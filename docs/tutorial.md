# Tutorial Flow

The game includes a parchment-style tutorial that introduces objectives and rewards.

1. **Journey to immortality** – start cultivating and reach 100% foundation.
   *Reward: 1 breakthrough pill.*
2. **Breakthrough to stage 2** – attempt a breakthrough.
   *Reward: unlock the astral tree and gain 50 insight.*

Progress is stored in `state.tutorial.step`, `state.tutorial.claimable` and `state.tutorial.completed`.

To disable the tutorial, set `state.tutorial.completed = true` in the console.
To restart, set `state.tutorial = { step: 0, completed: false, claimable: false }` or call `resetTutorial(state)` from `src/features/tutorial/logic.js`.
