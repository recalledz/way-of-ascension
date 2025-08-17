// WEAPONS-INTEGRATION: basic loot table rolling
import { LOOT_TABLES } from '../../data/lootTables.js';

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
