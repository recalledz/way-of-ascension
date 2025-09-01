import { WEAPON_TYPES } from './data/weaponTypes.js';
import { MATERIALS_STUB } from './data/materials.stub.js';
import { getImbuementMultiplier } from '../gearGeneration/imbuement.js';

/** @typedef {{
 *  typeKey:string,
 *  materialKey?:string,         // optional; for naming only (no stats impact)
 *  qualityKey?:'basic'|'refined'|'superior',
 *  level?:number,               // placeholder; no scaling applied yet
 *  stage?:number,               // zone stage for scaling
 *  imbuement?:{element:string,tier:number}
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
 *  affixes:string[],
 *  stats?:Record<string,number>
 * }} WeaponItem */

/** Compose final item. Minimal quality/affix support. */
export function generateWeapon({ typeKey, materialKey, qualityKey = 'basic', stage = 1, imbuement }/** @type {GenArgs} */){
  const type = WEAPON_TYPES[typeKey];
  if (!type) throw new Error(`Unknown weapon type: ${typeKey}`);

  const material = materialKey ? MATERIALS_STUB[materialKey] : undefined;

  const qualityMult = { basic: 1, refined: 1.1, superior: 1.25 }[qualityKey] || 1;
  const stageMult = 1.04 ** (stage - 1);
  const imbMult = getImbuementMultiplier(imbuement?.tier || 0);

  const abilityKeys = [];
  if (type.signatureAbilityKey) abilityKeys.push(type.signatureAbilityKey);

  const name = composeName({ typeName: type.displayName, materialName: material?.displayName });

  const base = {
    min: Math.round(type.base.min * qualityMult * stageMult * imbMult),
    max: Math.round(type.base.max * qualityMult * stageMult * imbMult),
    rate: type.base.rate,
  };

  /** @type {WeaponItem} */
  return {
    name,
    typeKey: type.key,
    materialKey: material?.key,
    base,
    scales: { ...type.scales },
    tags: [...type.tags],       // only 'physical' or []
    abilityKeys,                // e.g., ['powerSlash'] for swords
    quality: qualityKey,
    affixes: [],
    stats: type.implicitStats
      ? Object.fromEntries(
          Object.entries(type.implicitStats).map(([k, v]) => [k, v * stageMult * imbMult])
        )
      : undefined,
    imbuement: imbuement && { ...imbuement },
  };
}

function composeName({typeName, materialName}){
  return materialName ? `${materialName} ${typeName}` : typeName;
}
