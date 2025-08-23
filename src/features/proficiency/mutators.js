import { proficiencyState } from './state.js';
import { gainProficiency as applyGain, calculateProficiencyXP } from './logic.js';
import { updateWeaponProficiencyDisplay } from './ui/weaponProficiencyDisplay.js';
import { awardFromProficiency } from '../mind/index.js';

export function gainProficiency(key, amount, state = proficiencyState) {
  applyGain(key, amount, state);
  awardFromProficiency(state, amount);
  updateWeaponProficiencyDisplay(state);
}

export function gainProficiencyFromEnemy(key, enemyMaxHP, state = proficiencyState) {
  const xp = calculateProficiencyXP(enemyMaxHP);
  gainProficiency(key, xp, state);
}
