import { on } from "../../../shared/events.js";
import { getProficiency } from "../selectors.js";
import { WEAPON_CLASSES } from "../../weaponGeneration/data/weaponClasses.js";
import { WEAPON_ICONS } from "../../weaponGeneration/data/weaponIcons.js";

export function updateWeaponProficiencyDisplay(state) {
  const container = document.getElementById('proficiencyList');
  if (!container) return;
  const sections = [];
  for (const [key, cls] of Object.entries(WEAPON_CLASSES)) {
    const { value } = getProficiency(key, state);
    const level = Math.floor(value / 100);
    const progress = value % 100;
    let label = cls?.displayName || key;
    if (!label.endsWith('s')) label += 's';
    const icon = WEAPON_ICONS[key];
    const bonus = 1 + level * 0.01;
    const part = `<div class="weapon-prof"><div class="stat"><span>${icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ` : ''}${label} Level</span><span>${level}</span></div><div class="stat"><span>Experience</span><span>${progress.toFixed(0)}</span> / <span>100</span></div><div class="activity-progress-bar"><div class="progress-fill" style="width:${progress.toFixed(1)}%;"></div></div><div class="stat"><span>Bonus</span><span>${bonus.toFixed(2)}</span></div></div>`;
    sections.push(part);
  }
  container.innerHTML = sections.join('');
}

export function mountProficiencyUI(state) {
  function render() {
    updateWeaponProficiencyDisplay(state);
  }
  on("RENDER", render);
  render();
}
