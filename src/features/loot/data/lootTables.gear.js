import { ZONES } from '../../adventure/data/zoneIds.js';

export const GEAR_LOOT_TABLES = {
  [ZONES.STARTING]: [
    { baseKey: 'iron_cuirass', materialKey: 'iron', qualityKey: 'basic', weight: 100, chance: 0.35 },
    { baseKey: 'leather_tunic', materialKey: 'leather', weight: 100, chance: 0.35 },
    { baseKey: 'cotton_robe', materialKey: 'cotton', weight: 100, chance: 0.35 },
  ],
};
