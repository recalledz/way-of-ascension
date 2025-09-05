import { ZONES } from '../data/zones.js';
import { getAdventure } from '../selectors.js';
import { selectZone, selectArea, updateActivityAdventure } from '../logic.js';

let lastZoneHTML = '';
export function updateZoneButtons() {
  const zoneContainer = document.getElementById('zoneButtons');
  const adventure = getAdventure();
  if (!zoneContainer || !adventure) return;
  let html = '';
  ZONES.forEach((zone, index) => {
    if (index < (adventure.zonesUnlocked || 1)) {
      const active = index === (adventure.selectedZone || 0) ? ' active' : '';
      html += `<button class="btn zone-btn${active}">${zone.name}</button>`;
    }
  });
  if (html === lastZoneHTML) return;
  lastZoneHTML = html;
  zoneContainer.innerHTML = html;
  Array.from(zoneContainer.children).forEach((btn, index) => {
    btn.addEventListener('click', () => {
      if (selectZone(index)) updateActivityAdventure();
    });
  });
}

let lastAreaHTML = '';
export function updateAreaGrid() {
  const areaContainer = document.getElementById('areaGrid');
  const adventure = getAdventure();
  if (!areaContainer || !adventure) return;
  const currentZone = ZONES[adventure.selectedZone || 0];
  if (!currentZone || !currentZone.areas) return;
  let html = '';
  const buttonData = [];
  currentZone.areas.forEach((area, index) => {
    const areaKey = `${adventure.selectedZone}-${index}`;
    const isUnlocked = adventure.unlockedAreas[areaKey] || false;
    const isActive = index === (adventure.selectedArea || 0);
    const progress = adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };
    const cls = 'btn area-btn' + (isActive ? ' active' : '') + (!isUnlocked ? ' disabled' : '');
    const base = `${area.name}`;
    const status = isUnlocked
      ? (progress.bossDefeated ? ' ✓' : (progress.kills >= area.killReq ? ' 👹' : ` (${progress.kills}/${area.killReq})`))
      : ' 🔒';
    html += `<button class="${cls}" ${!isUnlocked ? 'disabled' : ''}>${base}${status}</button>`;
    buttonData.push({ isUnlocked, index });
  });
  if (html === lastAreaHTML) return;
  lastAreaHTML = html;
  areaContainer.innerHTML = html;
  Array.from(areaContainer.children).forEach((btn, i) => {
    const { isUnlocked, index } = buttonData[i];
    if (isUnlocked) {
      btn.addEventListener('click', () => {
        if (selectArea(index)) updateActivityAdventure();
      });
    }
  });
}
