import { WEAPONS } from '../weaponGeneration/data/weapons.js';

export const inventoryState = {
  // Seed the player with palm wraps in their inventory and fists equipped.
  // Store full weapon objects so downstream systems can rely on name/type metadata.
  inventory: [{ id: 'palmWraps', ...WEAPONS.palmWraps }],
  equipment: {
    mainhand: { ...WEAPONS.fist },
    head: null,
    body: null,
    foot: null,
    ring1: null,
    ring2: null,
    talisman1: null,
    talisman2: null,
    food1: null,
    food2: null,
    food3: null,
    food4: null,
    food5: null,
  },
};
