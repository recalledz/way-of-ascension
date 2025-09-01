import { BODY_BASES } from './bodyBases.js';

const MAX_STAGE = 100;
const STAGE_MULT = Math.pow(1.1, MAX_STAGE - 1);
const MAX_SAFE = Number.MAX_SAFE_INTEGER;

export function validate() {
  const errors = [];
  for (const [key, def] of Object.entries(BODY_BASES)) {
    const prot = def.baseProtection || {};
    for (const [pKey, value] of Object.entries(prot)) {
      const scaled = value * STAGE_MULT;
      if (scaled > MAX_SAFE) {
        errors.push(`bodyBases.${key}.baseProtection.${pKey} overflows at stage ${MAX_STAGE}`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}
