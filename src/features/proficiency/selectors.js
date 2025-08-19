import { proficiencyState } from './state.js';
import { getProficiency as resolveProficiency } from './logic.js';
import { WEAPONS } from '../weaponGeneration/data/weapons.js';

export function getProficiency(key, state = proficiencyState) {
  return resolveProficiency(key, state);
}

export function getWeaponProficiencyBonuses(state = proficiencyState) {
  const equipped = state.flags?.weaponsEnabled ? state.equipment?.mainhand : 'fist';
  const key = typeof equipped === 'string' ? equipped : equipped?.key;
  const weapon = WEAPONS[key] || WEAPONS.fist;
  const { value } = getProficiency(weapon.proficiencyKey, state);
  const level = Math.floor(value / 100);
  return { damage: level, speed: level * 0.01 };
}
