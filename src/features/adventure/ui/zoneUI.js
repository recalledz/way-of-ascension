import { S } from '../../../shared/state.js';
import { ZONES } from '../data/zones.js';

export function updateZoneButtons(selectZone) {
  const zoneContainer = document.getElementById('zoneButtons');
  if (!zoneContainer || !S.adventure) return;
  zoneContainer.innerHTML = '';
  ZONES.forEach((zone, index) => {
    if (index < (S.adventure.zonesUnlocked || 1)) {
      const button = document.createElement('button');
      button.className = 'btn zone-btn' + (index === (S.adventure.selectedZone || 0) ? ' active' : '');
      button.textContent = zone.name;
      button.onclick = () => selectZone(index);
      zoneContainer.appendChild(button);
    }
  });
}

export function updateAreaGrid(selectArea) {
  const areaContainer = document.getElementById('areaGrid');
  if (!areaContainer || !S.adventure) return;
  const currentZone = ZONES[S.adventure.selectedZone || 0];
  if (currentZone && currentZone.areas) {
    areaContainer.innerHTML = '';
    currentZone.areas.forEach((area, index) => {
      const button = document.createElement('button');
      const areaKey = `${S.adventure.selectedZone}-${index}`;
      const isUnlocked = S.adventure.unlockedAreas[areaKey] || false;
      const isActive = index === (S.adventure.selectedArea || 0);
      const progress = S.adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };

      button.className = 'btn area-btn' + (isActive ? ' active' : '') + (!isUnlocked ? ' disabled' : '');
      button.textContent = area.name;
      button.disabled = !isUnlocked;

      if (isUnlocked) {
        const statusText = progress.bossDefeated ? ' ✓' : (progress.kills >= area.killReq ? ' 👹' : ` (${progress.kills}/${area.killReq})`);
        button.textContent += statusText;
        button.onclick = () => selectArea(index);
      } else {
        button.textContent += ' 🔒';
      }

      areaContainer.appendChild(button);
    });
  }
}
