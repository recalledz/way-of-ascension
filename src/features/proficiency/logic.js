import { WEAPONS } from '../weaponGeneration/data/weapons.js';

// Proficiency is stored on the player state as an object: { [weaponClass]: number }
function resolveKey(key) {
  const weapon = WEAPONS[key];
  return weapon?.classKey || key;
}

export function calculateProficiencyXP(enemyMaxHP) {
  return Math.max(1, Math.ceil(enemyMaxHP / 30));
}

export function gainProficiency(key, amount, state) {
  state.proficiency = state.proficiency || {};
  const classKey = resolveKey(key);
  state.proficiency[classKey] = (state.proficiency[classKey] || 0) + amount;
}

export function getProficiency(key, state) {
  const classKey = resolveKey(key);
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
