import { FIST, PALM_WRAPS } from '../weaponGeneration/data/weapons.js';

export const inventoryState = {
  inventory: [{ ...PALM_WRAPS, id: 'palmWraps' }],
  equipment: { mainhand: { ...FIST }, head: null, body: null, foot: null, ring1: null, ring2: null, talisman1: null, talisman2: null, food: null },
};
