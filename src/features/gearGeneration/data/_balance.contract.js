import { GEAR_BASES } from './gearBases.js';

export function validate() {
  const errors = [];
  const MAX_STAGE = 500;
  const stageMult = 1.04 ** (MAX_STAGE - 1);

  for (const [key, base] of Object.entries(GEAR_BASES)) {
    const prot = base.baseProtection || {};
    for (const [pKey, val] of Object.entries(prot)) {
      const scaled = val * stageMult;
      if (!Number.isFinite(scaled) || scaled > Number.MAX_SAFE_INTEGER) {
        errors.push(`gearBases.${key}.baseProtection.${pKey} overflow at stage ${MAX_STAGE}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
