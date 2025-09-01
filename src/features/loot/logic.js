// WEAPONS-INTEGRATION: basic loot table rolling
import { LOOT_TABLES } from './data/lootTables.js';
import { rollWeaponDropForZone } from '../weaponGeneration/selectors.js';
import { rollGearDropForZone } from '../gearGeneration/selectors.js';
import { addToInventory } from '../inventory/mutators.js';
import { ZONES } from '../adventure/data/zoneIds.js';
import { TALISMANS } from '../talismans/data/talismans.js';
import { generateGear } from '../gearGeneration/logic.js';

export function toLootTableKey(id = '') {
  return (id || '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

export function rollLoot(key, rng = Math.random) {
  const table = (LOOT_TABLES[key] || []).filter(entry => !TALISMANS[entry.item]);
  if (!table || !table.length) return null;
  const total = table.reduce((sum, e) => sum + (e.weight || 0), 0);
  const roll = rng() * total;
  let acc = 0;
  for (const entry of table) {
    acc += entry.weight || 0;
    if (roll <= acc) return entry.item;
  }
  return null;
}

function rollDropRarity() {
  const r = Math.random();
  if (r < 0.01) return 'rare';
  if (r < 0.11) return 'magic';
  return 'normal';
}

export function onEnemyDefeated(state) {
  const zoneKey = state.world?.zoneKey ?? ZONES.STARTING;
  const zoneStage = (state.world?.stage ?? state.adventure?.currentArea ?? 0) + 1;
  const isBoss = state.adventure?.isBossFight || state.world?.isBoss;

  const weaponDrop = rollWeaponDropForZone(zoneKey, zoneStage, rollDropRarity());
  if (weaponDrop) {
    addToInventory(weaponDrop, state);
    state.log = state.log || [];
    state.log.push(`You found: ${weaponDrop.name}.`);
  }

  const gearDrop = rollGearDropForZone(zoneKey, zoneStage, rollDropRarity());
  if (gearDrop) {
    addToInventory(gearDrop, state);
    state.log = state.log || [];
    state.log.push(`You found: ${gearDrop.name}.`);
  }

  if (isBoss && Math.random() < 0.5) {
    const ring = generateGear({ baseKey: 'iron_ring', materialKey: 'iron', qualityKey: 'basic', stage: zoneStage, rarity: rollDropRarity() });
    addToInventory(ring, state);
    state.log = state.log || [];
    state.log.push(`You found: ${ring.name}.`);
  }

  // … add other rewards (xp, coins) as you already do
}

// Re-export weapon drop helper for any callers that previously imported it from this module.
export { rollWeaponDropForZone, rollGearDropForZone };
