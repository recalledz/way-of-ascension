// WEAPONS-INTEGRATION: add weapons to loot tables
export const LOOT_TABLES = {
  peacefulLands: [
    { item: 'ironStraightSword', weight: 8 },
    { item: 'crudeDagger', weight: 6 },
    { item: 'crudeRapier', weight: 4 },
    { item: 'herbs', weight: 82 },
  ],
  forestEdge: [
    { item: 'crudeHammer', weight: 5 },
    { item: 'crudeBludgeon', weight: 5 },
    { item: 'crudeAxe', weight: 5 },
    { item: 'ore', weight: 85 },
  ],
  meadowPath: [
    { item: 'bronzeSpear', weight: 5 },
    { item: 'dimFocus', weight: 3 },
    { item: 'starFocus', weight: 2 },
    { item: 'crudeKnuckles', weight: 3 },
    { item: 'crudeNunchaku', weight: 1 },
    { item: 'tameNunchaku', weight: 1 },
    { item: 'herbs', weight: 85 },
  ],
  // existing zones…
};

import { WEAPONS } from '../../weaponGeneration/data/weapons.js';
export const WEAPON_LOOT_TABLE = Object.fromEntries(
  Object.values(LOOT_TABLES)
    .flat()
    .filter(entry => WEAPONS[entry.item])
    .map(entry => [entry.item, (entry.weight || 0) / 100])
);

// TODO: derive weapon tables for additional zones
