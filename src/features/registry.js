const registeredFeatures = [];

export function registerFeature(feature) {
  registeredFeatures.push(feature);
}

export function initFeatureState() {
  const slices = {};
  for (const { id, init } of registeredFeatures) {
    if (typeof init === 'function') {
      const slice = init();
      if (slice !== undefined) {
        slices[id] = slice;
      }
    }
  }
  return slices;
}

export function tickFeatures(state, stepMs) {
  for (const { tick } of registeredFeatures) {
    if (typeof tick === 'function') {
      tick(state, stepMs);
    }
  }
}

export { registeredFeatures };

// --- New helpers for feature-first UI mounting ---

/**
 * Dynamically import and register all feature modules. Features register
 * themselves via side effects when their index modules run.
 */
export async function registerAllFeatures() {
  await Promise.all([
    import("./alchemy/index.js"),
    import("./proficiency/index.js"),
    import("./sect/index.js"),
    import("./cooking/index.js"),
    import("./mining/index.js"),
    import("./physique/index.js"),
    import("./karma/index.js"),
    // weaponGeneration has no UI mount but still participates in state
    import("./weaponGeneration/index.js"),
  ]);
}

/**
 * Compose the initial application state from all registered feature slices.
 * Includes the root `app` slice used by the game controller.
 */
export function composeInitialState() {
  return {
    app: { mode: "town", lastTick: performance.now() },
    ...initFeatureState(),
  };
}
