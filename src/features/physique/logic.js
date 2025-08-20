import { physiqueState } from './state.js';

function slice(state){
  return state.physique || state;
}

/**
 * Calculate bonuses provided by the player's physique stat.
 * Returns HP bonus and additional carry capacity.
 */
export function getPhysiqueEffects(state){
  const root = state.stats ? state : { stats: { physique: 10 } };
  const current = root.stats.physique || 10;
  const hpBonus = Math.max(0, Math.floor((current - 10) * 5));
  const carryCapacity = Math.max(0, current - 10);
  return { hpBonus, carryCapacity };
}

/**
 * Convenience helper to access the physique slice.
 */
export function getSlice(state = physiqueState){
  return slice(state);
}
