export const LOOT_TABLES = {
  peacefulLands: [
    { item: 'sword-common', weight: 2 },  // 2% chance
    { item: 'spear-common', weight: 2 },
    // TODO: include basic herbs, ores, etc.
  ],
  forestEdge: [
    { item: 'hammer-common', weight: 1 },
    { item: 'nunchaku-common', weight: 1.5 },
    // TODO: more drops
  ],
  // TODO: define for each zone later
};

export const WEAPON_LOOT_TABLE = Object.fromEntries(
  (LOOT_TABLES.peacefulLands || []).map(entry => {
    const weapon = entry.item.split('-')[0];
    return [weapon, (entry.weight || 0) / 100];
  })
);

// TODO: derive weapon tables for additional zones
