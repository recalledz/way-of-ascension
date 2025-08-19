import { weaponGenerationState } from './state.js';

export function getGeneratedWeapon(state = weaponGenerationState) {
  return state.generated;
}
