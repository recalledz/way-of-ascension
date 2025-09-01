import { GEAR_BASES } from './data/gearBases.js';
import { MATERIALS_STUB } from '../weaponGeneration/data/materials.stub.js';
import { ZONES as ZONE_IDS } from '../adventure/data/zoneIds.js';

const ELEMENTS = ['metal', 'earth', 'wood', 'water', 'fire'];
const ZONE_ELEMENT_WEIGHTS = {
  [ZONE_IDS.STARTING]: { earth: 3, wood: 3, metal: 1, water: 1, fire: 1 },
};

function pickWeighted(rows) {
  const total = rows.reduce((s, r) => s + (r.weight || 0), 0);
  let r = Math.random() * total;
  for (const row of rows) {
    r -= row.weight || 0;
    if (r <= 0) return row;
  }
  return rows[rows.length - 1];
}

/**
 * @typedef {{
 *  baseKey:string,
 *  materialKey?:string,
 *  qualityKey?:'basic'|'refined'|'superior'
 * }} GearGenArgs
 */

export function generateGear({ baseKey, materialKey, qualityKey = 'basic' }/** @type {GearGenArgs} */) {
  const base = GEAR_BASES[baseKey];
  if (!base) throw new Error(`Unknown base gear: ${baseKey}`);
  const material = materialKey ? MATERIALS_STUB[materialKey] : null;
  const qualityMult = { basic: 1, refined: 1.1, superior: 1.25 }[qualityKey] || 1;
  const protection = {
    armor: Math.round((base.baseProtection.armor || 0) * qualityMult),
    dodge: Math.round((base.baseProtection.dodge || 0) * qualityMult),
    qiShield: Math.round((base.baseProtection.qiShield || 0) * qualityMult),
  };
  const offense = {
    accuracy: Math.round((base.baseOffense?.accuracy || 0) * qualityMult),
  };
  const name = composeName(base.displayName, material?.displayName);
  return {
    key: base.key,
    type: 'armor',
    slot: base.slot,
    name,
    guardType: base.guardType,
    protection,
    offense,
    quality: qualityKey,
    material: material?.key,
  };
}

export function generateCultivationGear(gear, zoneKey) {
  const weights = ZONE_ELEMENT_WEIGHTS[zoneKey] || {};
  const element = pickWeighted(
    ELEMENTS.map(el => ({ key: el, weight: weights[el] || 1 }))
  ).key;
  const out = { ...gear };
  delete out.protection;
  delete out.offense;
  out.element = element;
  out.bonuses = {
    foundationMult: 0.1,
    breakthroughBonus: 0.05,
    qiRegenMult: 0.1,
  };
  out.cultivation = true;
  return out;
}

function composeName(baseName, materialName) {
  if (!materialName) return baseName;
  return baseName.toLowerCase().startsWith(materialName.toLowerCase())
    ? baseName
    : `${materialName} ${baseName}`;
}
