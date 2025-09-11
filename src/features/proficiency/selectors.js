import { proficiencyState } from './state.js';
import { getProficiency as resolveProficiency } from './logic.js';
import { getTunable } from '../../shared/tunables.js';

export function getProficiency(weapon, state = proficiencyState) {
  const res = resolveProficiency(weapon, state);
  const xpMult = getTunable('proficiency.xpGainMult', 1);
  return { ...res, xpMult };
}

export function getWeaponProficiencyBonuses(state = proficiencyState) {
  const equipped = state.flags?.weaponsEnabled ? state.equipment?.mainhand : 'fist';
  const weapon = equipped || 'fist';
  const { value } = getProficiency(weapon, state);
  const level = Math.floor(value / 100);
  return { damageMult: 1 + level * 0.02, speedMult: 1 + level * 0.01 };
}
