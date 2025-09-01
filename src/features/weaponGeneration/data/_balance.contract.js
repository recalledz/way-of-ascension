import { WEAPON_TYPES } from './weaponTypes.js';

export function validate() {
  const errors = [];

  for (const [key, def] of Object.entries(WEAPON_TYPES)) {
    // range checks
    if (def.base.min <= 0 || def.base.max <= 0 || def.base.max < def.base.min) {
      errors.push(`weaponTypes.${key}.base min/max invalid`);
    }
    if (def.base.rate <= 0 || def.base.rate > 20) {
      errors.push(`weaponTypes.${key}.rate out of bounds (0,20]`);
    }
    // scaling weights sanity (0..1, ~<=1.2 total to allow hybrids)
    const totalScale = (def.scales?.physique ?? 0) + (def.scales?.agility ?? 0) + (def.scales?.mind ?? 0);
    if (totalScale < 0 || totalScale > 1.2) {
      errors.push(`weaponTypes.${key}.scales total ${totalScale.toFixed(2)} out of [0,1.2]`);
    }

    const MAX_STAGE = 500;
    const stageMult = 1.04 ** (MAX_STAGE - 1);
    const scaledMax = def.base.max * stageMult;
    if (!Number.isFinite(scaledMax) || scaledMax > Number.MAX_SAFE_INTEGER) {
      errors.push(`weaponTypes.${key}.base overflow at stage ${MAX_STAGE}`);
    }
    if (def.implicitStats) {
      for (const [stat, val] of Object.entries(def.implicitStats)) {
        const scaled = val * stageMult;
        if (!Number.isFinite(scaled) || scaled > Number.MAX_SAFE_INTEGER) {
          errors.push(`weaponTypes.${key}.implicitStats.${stat} overflow at stage ${MAX_STAGE}`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
