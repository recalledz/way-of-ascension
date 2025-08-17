// WEAPONS-INTEGRATION: add weapons to loot tables
export const LOOT_TABLES = {
  peacefulLands: [
    { item: 'ironSword', weight: 5 },   // ~5% chance
    { item: 'herbs', weight: 95 },
  ],
  forestEdge: [
    { item: 'bronzeHammer', weight: 3 },
    { item: 'ironSword', weight: 4 },
    { item: 'ore', weight: 93 },
  ],
  meadowPath: [
    { item: 'elderWand', weight: 2 },
    { item: 'bronzeHammer', weight: 3 },
    { item: 'herbs', weight: 95 },
  ],
  // existing zones…
};

import { WEAPONS } from './weapons.js';
export const WEAPON_LOOT_TABLE = Object.fromEntries(
  Object.values(LOOT_TABLES)
    .flat()
    .filter(entry => WEAPONS[entry.item])
    .map(entry => [entry.item, (entry.weight || 0) / 100])
);

// TODO: derive weapon tables for additional zones
