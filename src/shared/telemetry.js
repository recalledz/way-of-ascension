// Minimal counters/timers to detect regressions during tuning.
// No persistence; gated by DEBUG usage in UI.

const counters = Object.create(null);

export function incCounter(key, by = 1) {
  counters[key] = (counters[key] || 0) + by;
}

export function getCounter(key) {
  return counters[key] || 0;
}

export function resetCounters(prefix = '') {
  for (const k of Object.keys(counters)) {
    if (!prefix || k.startsWith(prefix)) delete counters[k];
  }
}

export function withTimer(name, fn) {
  const t0 = performance.now();
  const result = fn();
  const t1 = performance.now();
  incCounter(`time.${name}.ms`, t1 - t0);
  incCounter(`time.${name}.calls`, 1);
  return result;
}

export function snapshotTelemetry() {
  return { ...counters };
}
