export const STATUSES = {
  bruiseMinor: {
    key: 'bruiseMinor',
    displayName: 'Bruise',
    durationMs: 3000,
    stackCap: 5,
    rules: { dmgTakenMult: 1.01 },
    scalesWith: 'physique',
  },
  fractureMinor: {
    key: 'fractureMinor',
    displayName: 'Fracture',
    durationMs: 4000,
    stackCap: 3,
    rules: { armorMult: 0.98 },
    scalesWith: 'physique',
  },
  staggerMinor: {
    key: 'staggerMinor',
    displayName: 'Stagger',
    durationMs: 1200,
    stackCap: 3,
    rules: { attackSpeedMult: 0.9, moveSpeedMult: 0.9 },
    scalesWith: 'mind',
  },
  qiDisruptMinor: {
    key: 'qiDisruptMinor',
    displayName: 'Qi Disruption',
    durationMs: 3000,
    stackCap: 5,
    rules: { regenWaterPerSecAdd: -0.2, maxQiMult: 0.99 },
    scalesWith: 'mind',
  },
  stunned: {
    key: 'stunned',
    displayName: 'Stunned',
    durationMs: 2000,
    stackCap: 1,
    rules: { attackSpeedMult: 0, moveSpeedMult: 0 },
  },
  stunWeakened: {
    key: 'stunWeakened',
    displayName: 'Stun Weakened',
    durationMs: 5000,
    stackCap: 1,
    rules: {}, // effect handled externally
  },
  stunImmune: {
    key: 'stunImmune',
    displayName: 'Stun Immune',
    durationMs: 15000,
    stackCap: 1,
    rules: {}, // effect handled externally
  },
};

export const STATUS_REGISTRY = STATUSES;
