// WEAPONS-INTEGRATION: basic loot table rolling
import { LOOT_TABLES } from './data/lootTables.js';
import { rollWeaponDropForZone } from '../weaponGeneration/selectors.js';
import { rollGearDropForZone } from '../gearGeneration/selectors.js';
import { rollRingDropForZone } from '../accessories/selectors.js';
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
  const zoneStage = (state.world?.stage ?? state.adventure?.currentArea ?? 0) + 1;
  const log = (state.log = state.log || []);
  const earlyZones = new Set([ZONES.STARTING]);
  const isEarlyZone = earlyZones.has(zoneKey);

  const weaponDrop = rollWeaponDropForZone(zoneKey, zoneStage);
  if (weaponDrop && weaponDrop.type !== 'talisman') {
    addToInventory(weaponDrop, state);
    log.push(`You found: ${weaponDrop.name}.`);
  }

  if (isEarlyZone) {
    const gearDrop = rollGearDropForZone(zoneKey, zoneStage);
    if (gearDrop && gearDrop.type !== 'talisman') {
      addToInventory(gearDrop, state);
      log.push(`You found: ${gearDrop.name}.`);
    }
  }

  if (state.adventure?.isBossFight) {
    const ringDrop = rollRingDropForZone(zoneKey);
    if (ringDrop && ringDrop.type !== 'talisman') {
      addToInventory(ringDrop, state);
      log.push(`You found: ${ringDrop.name}.`);
    }
  }

  // … add other rewards (xp, coins) as you already do
}

// Re-export drop helpers for any callers that previously imported them from this module.
export { rollWeaponDropForZone, rollGearDropForZone, rollRingDropForZone };
