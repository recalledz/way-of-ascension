import { ZONES } from '../../adventure/data/zoneIds.js';

export const GEAR_LOOT_TABLES = {
  [ZONES.STARTING]: [
    { baseKey: 'iron_cuirass', materialKey: 'iron', qualityKey: 'normal', weight: 100, chance: 0.35 },
    { baseKey: 'leather_tunic', materialKey: 'leather', qualityKey: 'normal', weight: 100, chance: 0.35 },
    { baseKey: 'cotton_robe', materialKey: 'cotton', qualityKey: 'normal', weight: 100, chance: 0.35 },
  ],
};
