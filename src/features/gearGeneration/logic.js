import { BODY_BASES } from './data/bodyBases.js';
import { MATERIALS_STUB } from '../weaponGeneration/data/materials.stub.js';

/**
 * @typedef {{
 *  baseKey:string,
 *  materialKey?:string,
 *  qualityKey?:'normal'|'magic'|'rare'
 * }} GearGenArgs
 */

export function generateGear({ baseKey, materialKey, qualityKey = 'normal' }/** @type {GearGenArgs} */) {
  const base = BODY_BASES[baseKey];
  if (!base) throw new Error(`Unknown base gear: ${baseKey}`);
  const material = materialKey ? MATERIALS_STUB[materialKey] : null;
  const qualityMult = { normal: 1, magic: 1.1, rare: 1.25 }[qualityKey] || 1;
  const defense = {
    armor: Math.round((base.baseDefense.armor || 0) * qualityMult),
    dodge: Math.round((base.baseDefense.dodge || 0) * qualityMult),
    qiShield: Math.round((base.baseDefense.qiShield || 0) * qualityMult),
  };
  const offense = {
    accuracy: Math.round((base.baseOffense?.accuracy || 0) * qualityMult),
  };
  const name = composeName(base.displayName, material?.displayName);
  return {
    key: base.key,
    type: 'armor',
    slot: 'body',
    name,
    defenseType: base.defenseType,
    defense,
    offense,
    quality: qualityKey,
    material: material?.key,
  };
}

function composeName(baseName, materialName) {
  if (!materialName) return baseName;
  return baseName.toLowerCase().startsWith(materialName.toLowerCase())
    ? baseName
    : `${materialName} ${baseName}`;
}
