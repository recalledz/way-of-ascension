import { on } from "../../../shared/events.js";
import { getProficiency } from "../selectors.js";
import { WEAPON_TYPES } from "../../weaponGeneration/data/weaponTypes.js";
import { WEAPON_ICONS } from "../../weaponGeneration/data/weaponIcons.js";

export function updateWeaponProficiencyDisplay(state) {
  const container = document.getElementById('weaponProficiencies');
  if (!container) return;
  container.innerHTML = '';
  const keys = Object.keys(WEAPON_ICONS);
  keys.forEach(key => {
    const { value } = getProficiency(key, state);
    const level = Math.floor(value / 100);
    const progress = value % 100;
    const type = WEAPON_TYPES[key];
    let label = type?.displayName || key;
    if (!label.endsWith('s')) label += 's';
    const icon = WEAPON_ICONS[key];
    const bonus = 1 + level * 0.01;
    const el = document.createElement('div');
    el.className = 'weapon-prof';
    const iconHtml = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ` : '';
    el.innerHTML = `
      <div class="stat"><span>${iconHtml}${label} Level</span><span>${level}</span></div>
      <div class="stat"><span>Experience</span><span>${progress.toFixed(0)}</span> / <span>100</span></div>
      <div class="activity-progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div class="stat"><span>Bonus</span><span>${bonus.toFixed(2)}</span></div>
    `;
    container.appendChild(el);
  });
}

export function mountProficiencyUI(state) {
  function render() {
    updateWeaponProficiencyDisplay(state);
  }
  on("RENDER", render);
  render();
}
