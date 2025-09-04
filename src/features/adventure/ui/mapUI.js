import { S } from '../../../shared/state.js';
import { log } from '../../../shared/utils/dom.js';
import { ZONES, isZoneUnlocked, isAreaUnlocked, getAreaById } from '../data/zones.js';
import { selectAreaById, ensureAdventure, updateActivityAdventure, startDungeon } from '../logic.js';
import { updateAdventureProgressBar } from './progressBar.js';

function getElementIcon(element) {
  const icons = {
    nature: '🌿',
    shadow: '🌙',
    ice: '❄️',
    fire: '🔥',
    earth: '🗿',
    wind: '💨'
  };
  return icons[element] || '⚡';
}

function selectAreaFromMap(zoneIndex, areaIndex, zoneId, areaId) {
  if (selectAreaById(zoneId, areaId, areaIndex)) {
    const area = getAreaById(zoneId, areaId);
    updateActivityAdventure();
    updateAdventureProgressBar(selectAreaById);
    log(`Selected area from map: ${area?.name || 'Unknown Area'}`, 'good');
  }
  hideMapOverlay();
}

function updateAreaContent() {
  ensureAdventure();
  const mapContent = document.getElementById('mapContentAreas');
  if (!mapContent) return;

  mapContent.innerHTML = '';

  ZONES.forEach((zone, zoneIndex) => {
    const isZoneUnlockedValue = isZoneUnlocked(zone.id, S);

    const accordion = document.createElement('div');
    accordion.className = `zone-accordion ${!isZoneUnlockedValue ? 'locked' : ''}`;

    // Zone header
    const header = document.createElement('div');
    header.className = 'zone-header';
    header.setAttribute('aria-label', `${zone.name} zone`);

    const zoneInfo = document.createElement('div');
    zoneInfo.className = 'zone-info';

    const elementIcon = document.createElement('div');
    elementIcon.className = 'zone-element-icon';
    elementIcon.style.background = zone.color;
    elementIcon.textContent = getElementIcon(zone.element);

    const zoneDetails = document.createElement('div');
    zoneDetails.className = 'zone-details';
    zoneDetails.innerHTML = `
      <h4>${zone.name}</h4>
      <p class="zone-description">${zone.description}</p>
    `;

    const expandIcon = document.createElement('div');
    expandIcon.className = 'zone-expand-icon';
    expandIcon.textContent = '▶';

    zoneInfo.appendChild(elementIcon);
    zoneInfo.appendChild(zoneDetails);
    header.appendChild(zoneInfo);
    header.appendChild(expandIcon);

    // Zone areas
    const areasContainer = document.createElement('div');
    areasContainer.className = 'zone-areas';

    if (isZoneUnlockedValue) {
      zone.areas.forEach((area, areaIndex) => {
        const areaKey = `${zone.id}-${area.id}`;
        const legacyAreaKey = `${zoneIndex}-${areaIndex}`;
        const isAreaUnlockedValue = isAreaUnlocked(zone.id, area.id, S) || S.adventure.unlockedAreas?.[legacyAreaKey] || false;
        const progress = S.adventure.areaProgress?.[areaKey] || S.adventure.areaProgress?.[legacyAreaKey] || { kills: 0, bossDefeated: false };
        const isCurrent = zoneIndex === S.adventure.currentZone && areaIndex === S.adventure.currentArea;

        const areaItem = document.createElement('div');
        areaItem.className = `area-item ${!isAreaUnlockedValue ? 'locked' : ''} ${isCurrent ? 'current' : ''}`;

        const areaInfo = document.createElement('div');
        areaInfo.className = 'area-info';
        areaInfo.innerHTML = `
          <h5>${area.name}</h5>
          <div class="area-enemy">vs ${area.enemy}</div>
        `;

        const areaStatus = document.createElement('div');
        areaStatus.className = 'area-status';

        if (!isAreaUnlockedValue) {
          areaStatus.innerHTML = '<span class="area-locked">🔒 Locked</span>';
        } else if (progress.bossDefeated) {
          areaStatus.innerHTML = '<span class="area-completed">✓ Completed</span>';
        } else {
          areaStatus.innerHTML = `<span class="area-progress">${progress.kills}/${area.killReq}</span>`;
        }

        areaItem.appendChild(areaInfo);
        areaItem.appendChild(areaStatus);

        if (isAreaUnlockedValue) {
          areaItem.onclick = () => selectAreaFromMap(zoneIndex, areaIndex, zone.id, area.id);
          areaItem.setAttribute('tabindex', '0');
          areaItem.setAttribute('role', 'button');
          areaItem.setAttribute('aria-label', `Select ${area.name}`);
        }

        areasContainer.appendChild(areaItem);
      });

      header.onclick = () => {
        const isExpanded = header.classList.contains('expanded');
        header.classList.toggle('expanded');
        areasContainer.classList.toggle('expanded');
        expandIcon.textContent = isExpanded ? '▶' : '▼';
      };
    }

    accordion.appendChild(header);
    accordion.appendChild(areasContainer);
    mapContent.appendChild(accordion);
  });
}

function updateDungeonContent() {
  ensureAdventure();
  const container = document.getElementById('mapContentDungeons');
  if (!container) return;
  container.innerHTML = '';

  ZONES.forEach(zone => {
    const list = zone.dungeons?.filter(d => S.adventure.discoveredDungeons?.includes(d.id));
    if (!list || list.length === 0) return;

    const zoneHeader = document.createElement('h4');
    zoneHeader.textContent = zone.name;
    container.appendChild(zoneHeader);

    list.forEach(d => {
      const btn = document.createElement('button');
      btn.className = 'btn dungeon-btn';
      btn.textContent = `${getElementIcon(d.element)} ${d.name}`;
      btn.onclick = () => {
        startDungeon(zone.id, d.id);
        updateActivityAdventure();
        hideMapOverlay();
      };
      container.appendChild(btn);
    });
  });
}

export function showMapOverlay() {
  const overlay = document.getElementById('mapOverlay');
  if (!overlay) return;

  overlay.style.display = 'flex';
  updateAreaContent();
  updateDungeonContent();

  const areaTab = document.getElementById('mapTabAreas');
  const dungeonTab = document.getElementById('mapTabDungeons');
  const areaContent = document.getElementById('mapContentAreas');
  const dungeonContent = document.getElementById('mapContentDungeons');
  function activate(tab) {
    if (tab === 'areas') {
      areaTab?.classList.add('active');
      dungeonTab?.classList.remove('active');
      areaContent.style.display = 'block';
      dungeonContent.style.display = 'none';
    } else {
      dungeonTab?.classList.add('active');
      areaTab?.classList.remove('active');
      areaContent.style.display = 'none';
      dungeonContent.style.display = 'block';
    }
  }
  areaTab?.addEventListener('click', () => activate('areas'));
  dungeonTab?.addEventListener('click', () => activate('dungeons'));
  activate('areas');

  const backdrop = document.getElementById('mapOverlayBackdrop');
  const closeButton = document.getElementById('closeMapButton');

  backdrop?.addEventListener('click', hideMapOverlay);
  closeButton?.addEventListener('click', hideMapOverlay);

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      hideMapOverlay();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

export function hideMapOverlay() {
  const overlay = document.getElementById('mapOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}
