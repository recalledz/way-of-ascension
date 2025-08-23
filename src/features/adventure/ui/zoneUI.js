import { ZONES } from '../data/zones.js';
import { getAdventure } from '../selectors.js';
import { selectZone, selectArea, updateActivityAdventure } from '../logic.js';

export function updateZoneButtons() {
  const zoneContainer = document.getElementById('zoneButtons');
  const adventure = getAdventure();
  if (!zoneContainer || !adventure) return;
  zoneContainer.innerHTML = '';
  ZONES.forEach((zone, index) => {
    if (index < (adventure.zonesUnlocked || 1)) {
      const button = document.createElement('button');
      button.className = 'btn zone-btn' + (index === (adventure.selectedZone || 0) ? ' active' : '');
      button.textContent = zone.name;
      button.onclick = () => {
        if (selectZone(index)) updateActivityAdventure();
      };
      zoneContainer.appendChild(button);
    }
  });
}

export function updateAreaGrid() {
  const areaContainer = document.getElementById('areaGrid');
  const adventure = getAdventure();
  if (!areaContainer || !adventure) return;
  const currentZone = ZONES[adventure.selectedZone || 0];
  if (currentZone && currentZone.areas) {
    areaContainer.innerHTML = '';
    currentZone.areas.forEach((area, index) => {
      const button = document.createElement('button');
      const areaKey = `${adventure.selectedZone}-${index}`;
      const isUnlocked = adventure.unlockedAreas[areaKey] || false;
      const isActive = index === (adventure.selectedArea || 0);
      const progress = adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };

      button.className = 'btn area-btn' + (isActive ? ' active' : '') + (!isUnlocked ? ' disabled' : '');
      button.textContent = area.name;
      button.disabled = !isUnlocked;

      if (isUnlocked) {
        const statusText = progress.bossDefeated ? ' ✓' : (progress.kills >= area.killReq ? ' 👹' : ` (${progress.kills}/${area.killReq})`);
        button.textContent += statusText;
        button.onclick = () => {
          if (selectArea(index)) updateActivityAdventure();
        };
      } else {
        button.textContent += ' 🔒';
      }

      areaContainer.appendChild(button);
    });
  }
}
