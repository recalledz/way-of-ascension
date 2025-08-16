import { WEAPON_FLAGS } from '../../data/weapons.js';
import { WEAPON_LOOT_TABLE } from '../../data/lootTables.js'; // WEAPONS-INTEGRATION

export function rollWeaponDrop(weapon, rng = Math.random) {
  if (!WEAPON_FLAGS[weapon]) return false;
  const rate = WEAPON_LOOT_TABLE[weapon] ?? 0;
  const result = rng() < rate;
  console.log('[weapon]', 'dropRoll', weapon, { rate, result });
  return result;
}

// CHANGELOG: Added weapon proficiency and drop systems.
