import { S } from "../../../shared/state.js";
import { on } from "../../../shared/events.js";
import { getProficiency } from "../selectors.js";
import { WEAPON_TYPES } from "../../weaponGeneration/data/weaponTypes.js";
import { WEAPON_ICONS } from "../../weaponGeneration/data/weaponIcons.js";
import { WEAPONS } from "../../weaponGeneration/data/weapons.js";
import { setText, setFill } from "../../../shared/utils/dom.js";

// Proficiency is tracked per weapon class (e.g., 'nunchaku'), not per individual item
const PROFICIENCY_CLASSES = Array.from(
  new Set(Object.values(WEAPONS).map(w => w.proficiencyKey))
);

function formatLabel(key) {
  const type = WEAPON_TYPES[key];
  if (type?.displayName) return type.displayName;
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

export function updateWeaponProficiencyDisplay(state = S) {
  for (const key of PROFICIENCY_CLASSES) {
    const { value } = getProficiency(key, state);
    const level = Math.floor(value / 100);
    const progress = value % 100;
    const label = formatLabel(key);
    const icon = WEAPON_ICONS[key];
    const labelEl = document.getElementById(`weaponLabel-${key}`);
    if (labelEl) {
      const text = `${label} Level`;
      labelEl.innerHTML = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ${text}` : text;
    }
    setText(`weaponLevel-${key}`, level);
    setText(`weaponExp-${key}`, progress.toFixed(0));
    setText(`weaponExpMax-${key}`, '100');
    setFill(`weaponExpFill-${key}`, progress / 100);
    const bonus = 1 + level * 0.01;
    setText(`weaponBonus-${key}`, bonus.toFixed(2));
  }
}

export function mountProficiencyUI(state) {
  const container = document.getElementById('weaponProficiencyList');
  if (container) {
    for (const key of PROFICIENCY_CLASSES) {
      const row = document.createElement('div');
      row.className = 'weapon-proficiency';
      row.innerHTML = `
        <div class="stat"><span id="weaponLabel-${key}"></span><span id="weaponLevel-${key}">0</span></div>
        <div class="stat"><span>Experience</span><span id="weaponExp-${key}">0</span> / <span id="weaponExpMax-${key}">100</span></div>
        <div class="activity-progress-bar"><div class="progress-fill" id="weaponExpFill-${key}"></div></div>
        <div class="stat"><span>Bonus</span><span id="weaponBonus-${key}">1.00</span></div>
      `;
      container.appendChild(row);
    }
  }
  function render() {
    updateWeaponProficiencyDisplay(state);
  }
  on("RENDER", render);
  render();
}
