import { proficiencyState } from './state.js';
import { getProficiency as resolveProficiency } from './logic.js';
import { WEAPONS } from '../weaponGeneration/data/weapons.js';
import { getTunable } from '../../shared/tunables.js';

export function getProficiency(key, state = proficiencyState) {
  const res = resolveProficiency(key, state);
  const xpMult = getTunable('proficiency.xpGainMult', 1);
  return { ...res, xpMult };
}

export function getWeaponProficiencyBonuses(state = proficiencyState) {
  const equipped = state.flags?.weaponsEnabled ? state.equipment?.mainhand : 'fist';
  const key = typeof equipped === 'string' ? equipped : equipped?.key;
  const weapon = WEAPONS[key] || WEAPONS.fist;
  const { value } = getProficiency(weapon.classKey, state);
  const level = Math.floor(value / 100);
  return { damageMult: 1 + level * 0.02, speedMult: 1 + level * 0.01 };
}
