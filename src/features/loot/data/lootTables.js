// WEAPONS-INTEGRATION: add weapons to loot tables
export const LOOT_TABLES = {
  peacefulLands: [
    { item: 'ironStraightSword', weight: 8 },
    { item: 'crudeDagger', weight: 6 },
    { item: 'crudeRapier', weight: 4 },
    { item: 'wood', weight: 82 },
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
    { item: 'wood', weight: 85 },
  ],
  // existing zones…
};

import { WEAPON_TYPES } from '../../weaponGeneration/data/weaponTypes.js';
import { generateWeapon } from '../../weaponGeneration/logic.js';

function parseWeaponKey(item) {
  const typeKey = Object.keys(WEAPON_TYPES).find(k => item.endsWith(k));
  if (!typeKey) return null;
  const materialKey = item.slice(0, item.length - typeKey.length) || undefined;
  return { typeKey, materialKey };
}

export const WEAPON_LOOT_TABLE = Object.fromEntries(
  Object.values(LOOT_TABLES)
    .flat()
    .map(entry => {
      const info = parseWeaponKey(entry.item);
      if (!info) return null;
      const { typeKey, materialKey } = info;
      return [
        entry.item,
        {
          weight: (entry.weight || 0) / 100,
          typeKey,
          materialKey,
          create: () => generateWeapon({ typeKey, materialKey }),
        },
      ];
    })
    .filter(Boolean)
);

// TODO: derive weapon tables for additional zones
