import { ZONES as ZONE_IDS } from '../adventure/data/zoneIds.js';

// Tiers and their stat multipliers
export const IMBUEMENT_TIERS = {
  0: 1,
  1: 1.1,
  2: 1.25,
  3: 1.45,
};

export function getImbuementMultiplier(tier = 0) {
  return IMBUEMENT_TIERS[tier] || 1;
}

// Zone themed element weights
export const ELEMENTS = ['metal', 'earth', 'wood', 'water', 'fire'];
export const ZONE_ELEMENT_WEIGHTS = {
  [ZONE_IDS.STARTING]: { earth: 3, wood: 3, metal: 1, water: 1, fire: 1 },
};

export function pickZoneElement(zoneKey, rng = Math.random) {
  const weights = ZONE_ELEMENT_WEIGHTS[zoneKey] || {};
  const rows = ELEMENTS.map(el => ({ key: el, weight: weights[el] || 1 }));
  const total = rows.reduce((s, r) => s + (r.weight || 0), 0);
  let r = rng() * total;
  for (const row of rows) {
    r -= row.weight || 0;
    if (r <= 0) return row.key;
  }
  return rows[0].key;
}
