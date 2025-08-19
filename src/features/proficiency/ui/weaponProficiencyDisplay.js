import { S } from '../../../game/state.js';
import { getEquippedWeapon } from '../../../game/selectors.js';
import { getProficiency } from '../selectors.js';
import { WEAPON_TYPES } from '../../weaponGeneration/data/weaponTypes.js';
import { WEAPON_ICONS } from '../../weaponGeneration/data/weaponIcons.js';
import { setText, setFill } from '../../../game/utils.js';

export function updateWeaponProficiencyDisplay(state = S) {
  const weapon = getEquippedWeapon(state);
  const { value } = getProficiency(weapon.proficiencyKey, state);
  const level = Math.floor(value / 100);
  const progress = value % 100;
  const type = WEAPON_TYPES[weapon.proficiencyKey];
  let label = type?.displayName || weapon.proficiencyKey;
  if (!label.endsWith('s')) label += 's';
  const icon = WEAPON_ICONS[weapon.proficiencyKey];
  const labelEl = document.getElementById('weaponLabel');
  if (labelEl) {
    const text = `${label} Level`;
    labelEl.innerHTML = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ${text}` : text;
  }
  setText('weaponLevel', level);
  setText('weaponExp', progress.toFixed(0));
  setText('weaponExpMax', '100');
  setFill('weaponExpFill', progress / 100);
  const bonus = 1 + level * 0.01;
  setText('weaponBonus', bonus.toFixed(2));
}
