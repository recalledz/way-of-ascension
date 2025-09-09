import { WEAPON_TYPES } from '../weaponGeneration/data/weaponTypes.js';

// Proficiency is stored on the player state as an object: { [weaponClass]: number }
function resolveClassKey(arg) {
  if (!arg) return 'fist';
  if (typeof arg === 'string') {
    return WEAPON_TYPES[arg]?.classKey || arg;
  }
  return arg.classKey || WEAPON_TYPES[arg.typeKey]?.classKey || arg.typeKey || 'fist';
}

export function calculateProficiencyXP(enemyMaxHP) {
  return Math.max(1, Math.ceil(enemyMaxHP / 30));
}

export function gainProficiency(weaponOrKey, amount, state) {
  state.proficiency = state.proficiency || {};
  const classKey = resolveClassKey(weaponOrKey);
  state.proficiency[classKey] = (state.proficiency[classKey] || 0) + amount;
}

export function getProficiency(weaponOrKey, state) {
  const classKey = resolveClassKey(weaponOrKey);
  const value = (state.proficiency && state.proficiency[classKey]) || 0;
  // Soft cap: returns multiplier >1 but growth slows down
  const bonus = 1 + Math.pow(value, 0.6) * 0.01;
  return { value, bonus };
}

/* Dev harness
const state = { proficiency: {} };
for (let i = 0; i < 100; i++) {
  gainProficiency('sword', 1, state);
  console.log(i + 1, getProficiency('sword', state).bonus);
}
*/
