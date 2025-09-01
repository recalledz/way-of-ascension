import { ZONES } from '../../adventure/data/zoneIds.js';

export const GEAR_LOOT_TABLES = {
  [ZONES.STARTING]: [
    { baseKey: 'iron_cuirass', materialKey: 'iron', qualityKey: 'normal', weight: 100, chance: 0.35 },
    { baseKey: 'leather_tunic', materialKey: 'leather', weight: 100, chance: 0.35 },
    { baseKey: 'cotton_robe', materialKey: 'cotton', weight: 100, chance: 0.35 },
    { baseKey: 'iron_helmet', materialKey: 'iron', weight: 100, chance: 0.35 },
    { baseKey: 'leather_cap', materialKey: 'leather', weight: 100, chance: 0.35 },
    { baseKey: 'cotton_headband', materialKey: 'cotton', weight: 100, chance: 0.35 },
    { baseKey: 'iron_boots', materialKey: 'iron', weight: 100, chance: 0.35 },
    { baseKey: 'leather_boots', materialKey: 'leather', weight: 100, chance: 0.35 },
    { baseKey: 'cotton_sandals', materialKey: 'cotton', weight: 100, chance: 0.35 },
  ],
};
