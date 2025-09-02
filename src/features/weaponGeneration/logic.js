import { WEAPON_TYPES } from './data/weaponTypes.js';
import { MATERIALS_STUB } from './data/materials.stub.js';
import { getImbuementMultiplier } from '../gearGeneration/imbuement.js';
import { MODIFIERS, MODIFIER_POOLS } from '../gearGeneration/data/modifiers.js';

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
 *  classKey:string,
 *  materialKey?:string,
 *  base:{
 *    phys:{min:number,max:number},
 *    rate:number,
 *    elems:Record<string,{min:number,max:number}>
 *  },
 *  tags:('physical')[]|[],
 *  abilityKeys:string[],
 *  quality:string,
 *  modifiers:string[],
 *  stats?:Record<string,number>,
 *  imbuement?:{element:string,tier:number}
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
    phys: {
      min: Math.round(type.base.min * qualityMult * stageMult * imbMult),
      max: Math.round(type.base.max * qualityMult * stageMult * imbMult),
    },
    rate: type.base.rate,
    elems: {},
  };

  const stats = type.implicitStats
    ? Object.fromEntries(
        Object.entries(type.implicitStats).map(([k, v]) => [k, v * stageMult * imbMult])
      )
    : undefined;

  const mods = rollModifiers('weapon', rarity);
  applyWeaponModifiers({ base }, mods);

  const tags = [...type.tags];
  if (imbuement?.element) {
    const elem = imbuement.element;
    const existing = base.elems[elem] || { min: 0, max: 0 };
    existing.min += base.phys.min;
    existing.max += base.phys.max;
    base.elems[elem] = existing;
    base.phys = { min: 0, max: 0 };
    const idx = tags.indexOf('physical');
    if (idx !== -1) tags.splice(idx, 1);
    if (!tags.includes(elem)) tags.push(elem);
  }

  /** @type {WeaponItem} */
  return {
    name,
    typeKey: type.key,
    classKey: type.classKey,
    materialKey: material?.key,
    base,
    tags,
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

function rollModifiers(itemType, rarity) {
  const config = {
    normal: [0, 0],
    magic: [1, 2],
    rare: [3, 4],
  };
  const [min, max] = config[rarity] || [0, 0];
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const keys = [...(MODIFIER_POOLS[itemType] || [])];
  const mods = [];
  for (let i = 0; i < count && keys.length; i++) {
    const idx = Math.floor(Math.random() * keys.length);
    const key = keys.splice(idx, 1)[0];
    mods.push({ key, ...MODIFIERS[key] });
  }
  return mods;
}

function applyWeaponModifiers(target, mods) {
  /** Roll and sum flat values per lane. */
  const flatTotals = {};
  /** Sum percentage bonuses per lane. */
  const pctTotals = {};

  for (const mod of mods) {
    if (mod.range) {
      // Roll separate additions for min/max damage within the provided range.
      const roll = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      let min = roll(mod.range.min, mod.range.max);
      let max = roll(mod.range.min, mod.range.max);
      if (min > max) [min, max] = [max, min];
      const totals = flatTotals[mod.lane] || { min: 0, max: 0 };
      totals.min += min;
      totals.max += max;
      flatTotals[mod.lane] = totals;
    } else if (typeof mod.value === 'number') {
      pctTotals[mod.lane] = (pctTotals[mod.lane] || 0) + mod.value;
    }
  }

  // Apply physical damage flats then multiply by percentage lanes.
  const physFlat = flatTotals.physFlat || { min: 0, max: 0 };
  target.base.phys.min += physFlat.min;
  target.base.phys.max += physFlat.max;
  const physMult = (1 + (pctTotals.damage || 0)) * (1 + (pctTotals.physPct || 0));
  target.base.phys.min = Math.round(target.base.phys.min * physMult);
  target.base.phys.max = Math.round(target.base.phys.max * physMult);

  // Handle elemental damage additions and percentage modifiers.
  const elements = ['fire', 'water', 'wood', 'earth', 'metal'];
  for (const elem of elements) {
    const flat = flatTotals[`${elem}Flat`];
    const pct = (1 + (pctTotals.damage || 0)) * (1 + (pctTotals[`${elem}Pct`] || 0));
    if (flat || pct !== 1) {
      const base = target.base.elems[elem] || { min: 0, max: 0 };
      if (flat) {
        base.min += flat.min;
        base.max += flat.max;
      }
      base.min = Math.round(base.min * pct);
      base.max = Math.round(base.max * pct);
      target.base.elems[elem] = base;
    }
  }
}
