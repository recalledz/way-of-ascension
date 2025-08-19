import { weaponGenerationState } from './state.js';
import { generateWeapon } from './logic.js';

export function generateWeaponItem(args) {
  weaponGenerationState.generated = generateWeapon(args);
  return weaponGenerationState.generated;
}

export function clearGeneratedWeapon() {
  weaponGenerationState.generated = null;
}
