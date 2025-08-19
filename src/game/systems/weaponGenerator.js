import { WEAPON_TYPES } from '../../data/weaponTypes.js';
import { MATERIALS_STUB } from '../../data/materials.stub.js';

/** @typedef {{
 *  typeKey:string,
 *  materialKey?:string,         // optional; for naming only (no stats impact)
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
export function generateWeapon(args/** @type {GenArgs} */){
  const type = WEAPON_TYPES[args.typeKey];
  if (!type) throw new Error(`Unknown weapon type: ${args.typeKey}`);

  const material = args.materialKey ? MATERIALS_STUB[args.materialKey] : undefined;

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
    quality: 'normal',
    affixes: [],
  };
}

function composeName({typeName, materialName}){
  return materialName ? `${materialName} ${typeName}` : typeName;
}
