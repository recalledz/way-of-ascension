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
