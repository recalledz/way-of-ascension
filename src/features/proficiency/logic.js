import { WEAPON_TYPES } from '../weaponGeneration/data/weaponTypes.js';

// Proficiency is stored on the player state as an object: { [weaponClass]: number }
function resolveClassKey(target) {
  if (typeof target === 'string') {
    return WEAPON_TYPES[target]?.classKey || target;
  }
  if (target && typeof target === 'object') {
    return target.classKey || WEAPON_TYPES[target.typeKey]?.classKey || target.typeKey;
  }
  return target;
}

export function calculateProficiencyXP(enemyMaxHP) {
  return Math.max(1, Math.ceil(enemyMaxHP / 30));
}

export function gainProficiency(weapon, amount, state) {
  state.proficiency = state.proficiency || {};
  const classKey = resolveClassKey(weapon);
  if (!classKey) return;
  state.proficiency[classKey] = (state.proficiency[classKey] || 0) + amount;
}

export function getProficiency(weapon, state) {
  const classKey = resolveClassKey(weapon);
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
