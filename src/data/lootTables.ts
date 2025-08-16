export interface LootItem {
  item: string; // placeholder key
  weight: number;
}

export interface ZoneLootTable {
  tier: number;
  entries: LootItem[];
}

// TODO: connect to real items and expand tables.
export const LOOT_TABLES: Record<string, ZoneLootTable> = {
  tutorial: {
    tier: 1,
    entries: [
      { item: 'fist', weight: 1 },
      { item: 'potion', weight: 3 },
    ],
  },
  forest: {
    tier: 2,
    entries: [
      { item: 'sword', weight: 1 },
      { item: 'herb', weight: 2 },
    ],
  },
  mountain: {
    tier: 3,
    entries: [
      { item: 'hammer', weight: 1 },
      { item: 'gem', weight: 0.5 },
    ],
  },
};
