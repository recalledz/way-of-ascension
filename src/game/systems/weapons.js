import { WEAPON_CONFIG, WEAPON_FLAGS } from '../../../data/weapons.js';
import { WEAPON_LOOT_TABLE } from '../../../data/lootTables.js'; // WEAPONS-INTEGRATION

export function ensureWeaponProficiency(state, weapon) {
  if (!WEAPON_FLAGS[weapon] || weapon === 'fist') return;
  state.proficiencies = state.proficiencies || {};
  if (!state.proficiencies[weapon]) {
    const base = WEAPON_CONFIG[weapon].proficiencyBase;
    state.proficiencies[weapon] = { level: 1, exp: 0, expMax: base };
  }
  console.log('[weapon]', 'proficiency', weapon, state.proficiencies[weapon]);
}

export function rollWeaponDrop(weapon, rng = Math.random) {
  if (!WEAPON_FLAGS[weapon]) return false;
  const rate = WEAPON_LOOT_TABLE[weapon] ?? 0;
  const result = rng() < rate;
  console.log('[weapon]', 'dropRoll', weapon, { rate, result });
  return result;
}

// CHANGELOG: Added weapon proficiency and drop systems.
