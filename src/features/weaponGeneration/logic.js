import { WEAPON_TYPES } from './data/weaponTypes.js';
import { MATERIALS_STUB } from './data/materials.stub.js';
import { getImbuementMultiplier } from '../gearGeneration/imbuement.js';
import { MODIFIERS, MODIFIER_KEYS } from '../gearGeneration/data/modifiers.js';

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
 *  tags:('physical')[]|[],
 *  abilityKeys:string[],
 *  quality:string,
 *  modifiers:string[],
 *  stats?:Record<string,number>
 * }} WeaponItem */

/** Compose final item. Minimal quality/affix support. */
export function generateWeapon({ typeKey, materialKey, qualityKey = 'basic', stage = 1, imbuement, rarity = 'normal' }/** @type {GenArgs & {rarity?:'normal'|'magic'|'rare'}} */){
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

  const stats = type.implicitStats
    ? Object.fromEntries(
        Object.entries(type.implicitStats).map(([k, v]) => [k, v * stageMult * imbMult])
      )
    : undefined;

  const mods = rollModifiers(rarity);
  applyWeaponModifiers({ base }, mods);

  /** @type {WeaponItem} */
  return {
    name,
    typeKey: type.key,
    materialKey: material?.key,
    base,
    tags: [...type.tags],       // only 'physical' or []
    abilityKeys,                // e.g., ['powerSlash'] for swords
    quality: qualityKey,
    rarity,
    modifiers: mods.map(m => m.key),
    stats,
    imbuement: imbuement && { ...imbuement },
  };
}

function composeName({typeName, materialName}){
  return materialName ? `${materialName} ${typeName}` : typeName;
}

function rollModifiers(rarity) {
  const config = {
    normal: [0, 0],
    magic: [1, 2],
    rare: [3, 4],
  };
  const [min, max] = config[rarity] || [0, 0];
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const keys = [...MODIFIER_KEYS];
  const mods = [];
  for (let i = 0; i < count && keys.length; i++) {
    const idx = Math.floor(Math.random() * keys.length);
    const key = keys.splice(idx, 1)[0];
    mods.push({ key, ...MODIFIERS[key] });
  }
  return mods;
}

function applyWeaponModifiers(target, mods) {
  const totals = {};
  for (const mod of mods) totals[mod.lane] = (totals[mod.lane] || 0) + mod.value;
  for (const lane of Object.keys(totals)) {
    const val = 1 + totals[lane];
    switch (lane) {
      case 'damage':
        target.base.min = Math.round(target.base.min * val);
        target.base.max = Math.round(target.base.max * val);
        break;
    }
  }
}
