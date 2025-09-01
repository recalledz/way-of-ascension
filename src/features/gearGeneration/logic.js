import { GEAR_BASES } from './data/gearBases.js';
import { MATERIALS_STUB } from '../weaponGeneration/data/materials.stub.js';
import { getImbuementMultiplier, pickZoneElement } from './imbuement.js';
import { MODIFIERS, MODIFIER_KEYS } from './data/modifiers.js';

/**
 * @typedef {{
 *  baseKey:string,
 *  materialKey?:string,
 *  qualityKey?:'basic'|'refined'|'superior',
 *  stage?:number
 * }} GearGenArgs
 */

export function generateGear({ baseKey, materialKey, qualityKey = 'basic', stage = 1, imbuement, rarity = 'normal' }/** @type {GearGenArgs & {imbuement?:{element:string,tier:number},rarity?:'normal'|'magic'|'rare'}} */) {
  const base = GEAR_BASES[baseKey];
  if (!base) throw new Error(`Unknown base gear: ${baseKey}`);
  const material = materialKey ? MATERIALS_STUB[materialKey] : null;
  const qualityMult = { basic: 1, refined: 1.1, superior: 1.25 }[qualityKey] || 1;
  const stageMult = 1.04 ** (stage - 1);
  const imbMult = getImbuementMultiplier(imbuement?.tier || 0);
  const protection = {
    armor: Math.round((base.baseProtection.armor || 0) * qualityMult * stageMult * imbMult),
    dodge: Math.round((base.baseProtection.dodge || 0) * qualityMult * stageMult * imbMult),
    qiShield: Math.round((base.baseProtection.qiShield || 0) * qualityMult * stageMult * imbMult),
  };
  const offense = {
    accuracy: Math.round((base.baseOffense?.accuracy || 0) * qualityMult * imbMult),
  };
  const name = composeName(base.displayName, material?.displayName);
  /** roll and apply modifiers */
  const mods = rollModifiers(rarity);
  applyGearModifiers({ protection, offense }, mods);

  const type = base.slot === 'ring' ? 'ring' : 'armor';

  return {
    key: base.key,
    type,
    slot: base.slot,
    name,
    guardType: base.guardType,
    protection,
    offense,
    quality: qualityKey,
    material: material?.key,
    rarity,
    modifiers: mods.map(m => m.key),
    imbuement: imbuement && { ...imbuement },
  };
}

export function generateCultivationGear(gear, zoneKey) {
  const element = pickZoneElement(zoneKey);
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

function applyGearModifiers(target, mods) {
  const totals = {};
  for (const mod of mods) {
    totals[mod.lane] = (totals[mod.lane] || 0) + mod.value;
  }
  for (const lane of Object.keys(totals)) {
    const val = 1 + totals[lane];
    switch (lane) {
      case 'armor':
        if (target.protection && target.protection.armor)
          target.protection.armor = Math.round(target.protection.armor * val);
        break;
      case 'dodge':
        if (target.protection && target.protection.dodge)
          target.protection.dodge = Math.round(target.protection.dodge * val);
        break;
      case 'accuracy':
        if (target.offense && target.offense.accuracy)
          target.offense.accuracy = Math.round(target.offense.accuracy * val);
        break;
    }
  }
}
