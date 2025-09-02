import { S } from "../../../shared/state.js";
import { on } from "../../../shared/events.js";
import { getEquippedWeapon } from "../../inventory/selectors.js";
import { getProficiency } from "../selectors.js";
import { WEAPON_CLASSES } from "../../weaponGeneration/data/weaponClasses.js";
import { WEAPON_ICONS } from "../../weaponGeneration/data/weaponIcons.js";
import { setText, setFill } from "../../../shared/utils/dom.js";

export function updateWeaponProficiencyDisplay(state = S) {
  const weapon = getEquippedWeapon(state);
  const { value } = getProficiency(weapon.classKey, state);
  const level = Math.floor(value / 100);
  const progress = value % 100;
  const cls = WEAPON_CLASSES[weapon.classKey];
  let label = cls?.displayName || weapon.classKey;
  if (!label.endsWith('s')) label += 's';
  const icon = WEAPON_ICONS[weapon.classKey];
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

export function mountProficiencyUI(state) {
  function render() {
    updateWeaponProficiencyDisplay(state);
  }
  on("RENDER", render);
  render();
}
