// Proficiency is stored on the player state as an object: { [weaponKey]: number }
export function gainProficiency(key, amount, state) {
  state.proficiency = state.proficiency || {};
  state.proficiency[key] = (state.proficiency[key] || 0) + amount;
}

export function getProficiency(key, state) {
  const value = (state.proficiency && state.proficiency[key]) || 0;
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
