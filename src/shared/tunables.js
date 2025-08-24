// Central registry for live balance knobs (non-persistent).
// Usage: getTunable('combat.damageMult', 1)
// You can hot-edit values via the dev tuner; defaults leave gameplay unchanged.

const _registry = Object.create(null);

// Default, safe multipliers
const DEFAULTS = {
  // buckets
  'combat.damageMult': 1,
  'combat.attackRateMult': 1,
  'combat.accuracyMult': 1,
  'progression.foundationGainMult': 1,
  'progression.qiRegenMult': 1,
  'proficiency.xpGainMult': 1,
  'loot.dropRateMult': 1,
};

export function getTunable(key, fallback) {
  if (key in _registry) return _registry[key];
  if (key in DEFAULTS) return DEFAULTS[key];
  return fallback;
}

// Assign without persisting to saves.
export function setTunable(key, value) {
  _registry[key] = Number.isFinite(value) ? value : DEFAULTS[key] ?? 1;
}

export function resetTunables() {
  Object.keys(_registry).forEach(k => delete _registry[k]);
}

export function getAllTunables() {
  const out = {};
  for (const k of Object.keys(DEFAULTS)) out[k] = getTunable(k);
  return out;
}
