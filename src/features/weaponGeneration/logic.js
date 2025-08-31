import { WEAPON_TYPES } from './data/weaponTypes.js';
import { MATERIALS_STUB } from './data/materials.stub.js';

/** @typedef {{
 *  typeKey:string,
 *  materialKey?:string,         // optional; for naming only (no stats impact)
 *  qualityKey?:'normal'|'magic'|'rare',
 *  level?:number                // placeholder; no scaling applied yet
 * }} GenArgs */

/** @typedef {{
 *  name:string,
 *  typeKey:string,
 *  materialKey?:string,
 *  base:{min:number,max:number,rate:number},
 *  scales:{physique:number,agility:number,mind:number},
 *  tags:('physical')[]|[],
 *  abilityKeys:string[],
 *  quality:string,
 *  affixes:string[]
 * }} WeaponItem */

/** Compose final item. Minimal quality/affix support. */
export function generateWeapon({ typeKey, materialKey, qualityKey = 'normal' }/** @type {GenArgs} */){
  const type = WEAPON_TYPES[typeKey];
  if (!type) throw new Error(`Unknown weapon type: ${typeKey}`);

  const material = materialKey ? MATERIALS_STUB[materialKey] : undefined;

  const abilityKeys = [];
  if (type.signatureAbilityKey) abilityKeys.push(type.signatureAbilityKey);

  const name = composeName({ typeName: type.displayName, materialName: material?.displayName });

  /** @type {WeaponItem} */
  return {
    name,
    typeKey: type.key,
    materialKey: material?.key,
    base: { ...type.base },
    scales: { ...type.scales },
    tags: [...type.tags],       // only 'physical' or []
    abilityKeys,                // e.g., ['powerSlash'] for swords
    quality: qualityKey,
    affixes: [],
  };
}

function composeName({typeName, materialName}){
  return materialName ? `${materialName} ${typeName}` : typeName;
}
