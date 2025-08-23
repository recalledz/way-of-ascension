// WEAPONS-INTEGRATION: basic loot table rolling
import { LOOT_TABLES } from './data/lootTables.js';
import { rollWeaponDropForZone } from '../weaponGeneration/selectors.js';
import { rollGearDropForZone } from '../gearGeneration/selectors.js';
import { addToInventory } from '../inventory/mutators.js';
import { ZONES } from '../adventure/data/zoneIds.js';

export function toLootTableKey(id = '') {
  return (id || '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

export function rollLoot(key, rng = Math.random) {
  const table = LOOT_TABLES[key];
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

export function onEnemyDefeated(state) {
  const zoneKey = state.world?.zoneKey ?? ZONES.STARTING;

  const weaponDrop = rollWeaponDropForZone(zoneKey);
  if (weaponDrop) {
    addToInventory(weaponDrop, state);
    state.log = state.log || [];
    state.log.push(`You found: ${weaponDrop.name}.`);
  }

  const gearDrop = rollGearDropForZone(zoneKey);
  if (gearDrop) {
    addToInventory(gearDrop, state);
    state.log = state.log || [];
    state.log.push(`You found: ${gearDrop.name}.`);
  }

  // … add other rewards (xp, coins) as you already do
}

// Re-export weapon drop helper for any callers that previously imported it from this module.
export { rollWeaponDropForZone, rollGearDropForZone };
