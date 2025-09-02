import { S } from "../../../shared/state.js";
import { on } from "../../../shared/events.js";
import { getProficiency } from "../selectors.js";
import { WEAPON_CLASSES } from "../../weaponGeneration/data/weaponClasses.js";
import { WEAPON_ICONS } from "../../weaponGeneration/data/weaponIcons.js";

export function updateWeaponProficiencyDisplay(state = S) {
  const list = document.getElementById('proficiencyList');
  if (!list) return;
  list.innerHTML = '';

  for (const classKey of Object.keys(WEAPON_CLASSES)) {
    const { value } = getProficiency(classKey, state);
    const level = Math.floor(value / 100);
    const progress = value % 100;
    let label = WEAPON_CLASSES[classKey]?.displayName || classKey;
    if (!label.endsWith('s')) label += 's';
    const icon = WEAPON_ICONS[classKey];
    const bonus = 1 + level * 0.01;
    const iconHtml = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ` : '';

    const entry = document.createElement('div');
    entry.className = 'weapon-proficiency';
    entry.innerHTML = `
      <div class="stat"><span>${iconHtml}${label} Level</span><span>${level}</span></div>
      <div class="stat"><span>Experience</span><span>${progress.toFixed(0)}</span> / <span>100</span></div>
      <div class="activity-progress-bar"><div class="progress-fill" style="width:${progress}%;"></div></div>
      <div class="stat"><span>Bonus</span><span>${bonus.toFixed(2)}</span></div>
    `;
    list.appendChild(entry);
  }
}

export function mountProficiencyUI(state) {
  function render() {
    updateWeaponProficiencyDisplay(state);
  }
  on("RENDER", render);
  render();
}

