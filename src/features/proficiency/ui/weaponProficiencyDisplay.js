import { S } from "../../../shared/state.js";
import { on } from "../../../shared/events.js";
import { getProficiency } from "../selectors.js";
import { WEAPON_TYPES } from "../../weaponGeneration/data/weaponTypes.js";
import { WEAPON_ICONS } from "../../weaponGeneration/data/weaponIcons.js";

export function updateWeaponProficiencyDisplay(state = S) {
  const container = document.getElementById('weaponProficiencyList');
  if (!container) return;
  let html = '';
  for (const key of Object.keys(WEAPON_ICONS)) {
    const { value } = getProficiency(key, state);
    const level = Math.floor(value / 100);
    const progress = value % 100;
    const type = WEAPON_TYPES[key];
    let label = type?.displayName || key;
    label = label.charAt(0).toUpperCase() + label.slice(1);
    if (!label.endsWith('s')) label += 's';
    const icon = WEAPON_ICONS[key];
    const bonus = 1 + level * 0.01;
    html += `
      <div class="weapon-prof">
        <div class="stat"><span>${icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ` : ''}${label} Level</span><span>${level}</span></div>
        <div class="stat"><span>Experience</span><span>${progress.toFixed(0)}</span> / <span>100</span></div>
        <div class="activity-progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="stat"><span>Bonus</span><span>${bonus.toFixed(2)}</span></div>
      </div>`;
  }
  container.innerHTML = html;
}

export function mountProficiencyUI(state) {
  function render() {
    updateWeaponProficiencyDisplay(state);
  }
  on("RENDER", render);
  render();
}
