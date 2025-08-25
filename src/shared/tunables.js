export const DEFAULTS = {
  'combat.damageMult': 1,
  'combat.attackRateMult': 1,
  'progression.foundationGainMult': 1,
  'progression.qiRegenMult': 1,
};
let _overrides = Object.create(null);

export function getTunable(key, fallback = 1) {
  return (_overrides[key] ?? DEFAULTS[key] ?? fallback);
}
export function setTunable(key, value) {
  const v = Number(value);
  _overrides[key] = Number.isFinite(v) ? v : (DEFAULTS[key] ?? 1);
}
export function resetTunables() { _overrides = Object.create(null); }

// Convenience: allow quick tuning from DevTools console: tune.set(...), tune.reset()
if (typeof window !== 'undefined') {
  window.tune = { get: getTunable, set: setTunable, reset: resetTunables, defaults: DEFAULTS };
}

export function getAllTunables() {
  const out = {};
  for (const k of Object.keys(DEFAULTS)) out[k] = getTunable(k);
  return out;
}
