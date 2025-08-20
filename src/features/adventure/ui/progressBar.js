import { S } from '../../../game/state.js';
import { ZONES, getZoneById, isAreaUnlocked } from '../data/zones.js';

let currentTooltip = null;

function showTooltip(event, area, progress) {
  hideTooltip();
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip visible';
  const lootText = area.loot ? Object.entries(area.loot).map(([item, qty]) => `${qty} ${item}`).join(', ') : 'No special loot';
  tooltip.innerHTML = `
    <h6>${area.name}</h6>
    <div class="tooltip-kills">Required: ${area.killReq} kills</div>
    <div class="tooltip-kills">Progress: ${progress.kills}/${area.killReq}</div>
    <div class="tooltip-loot">Loot: ${lootText}</div>
    ${area.description ? `<div style="margin-top: 4px; font-size: 10px; opacity: 0.8;">${area.description}</div>` : ''}
  `;
  document.body.appendChild(tooltip);
  currentTooltip = tooltip;
  const rect = event.target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  let top = rect.top - tooltipRect.height - 8;
  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8;
  if (top < 8) top = rect.bottom + 8;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

export function updateAdventureProgressBar(selectAreaById) {
  if (!S.adventure) return;
  const progressBar = document.getElementById('adventureProgressBar');
  if (!progressBar) return;
  const currentZoneId = ZONES[S.adventure.selectedZone || 0]?.id;
  const currentZone = getZoneById(currentZoneId);
  if (!currentZone || !currentZone.areas) return;
  progressBar.innerHTML = '';
  currentZone.areas.forEach((area, index) => {
    const areaKey = `${currentZoneId}-${area.id}`;
    const legacyAreaKey = `${S.adventure.selectedZone}-${index}`;
    const isUnlocked = isAreaUnlocked(currentZoneId, area.id, S) || S.adventure.unlockedAreas?.[legacyAreaKey] || false;
    const isCurrent = index === (S.adventure.currentArea || 0) && (S.adventure.selectedZone === S.adventure.currentZone);
    const progress = S.adventure.areaProgress?.[areaKey] || S.adventure.areaProgress?.[legacyAreaKey] || { kills: 0, bossDefeated: false };
    const segment = document.createElement('div');
    segment.className = 'progress-segment';
    segment.setAttribute('aria-label', `${area.name}: ${isUnlocked ? `${progress.kills}/${area.killReq} kills` : 'Locked'}`);
    if (isUnlocked) {
      segment.classList.add('unlocked');
      segment.textContent = area.name.split(' ')[0];
      segment.style.background = `linear-gradient(135deg, ${currentZone.color}88, ${currentZone.color}cc)`;
      segment.style.borderColor = currentZone.color;
      if (progress.bossDefeated) {
        segment.innerHTML = segment.textContent + ' ✓';
      }
    } else {
      segment.classList.add('locked');
      segment.innerHTML = '<span class="lock-icon">🔒</span>';
      segment.setAttribute('title', `${area.name} - Locked`);
    }
    if (isCurrent) {
      segment.classList.add('current');
      const playerIcon = document.createElement('div');
      playerIcon.className = 'player-icon';
      playerIcon.innerHTML = '🪷';
      segment.appendChild(playerIcon);
    }
    segment.addEventListener('mouseenter', (e) => showTooltip(e, area, progress));
    segment.addEventListener('mouseleave', hideTooltip);
    if (isUnlocked) {
      segment.onclick = () => selectAreaById(currentZoneId, area.id, index);
      segment.style.cursor = 'pointer';
      segment.setAttribute('tabindex', '0');
      segment.setAttribute('role', 'button');
    }
    progressBar.appendChild(segment);
  });
  const currentArea = currentZone.areas[S.adventure.currentArea || 0];
  const currentAreaKey = `${currentZoneId}-${currentArea?.id}`;
  const legacyCurrentAreaKey = `${S.adventure.currentZone}-${S.adventure.currentArea}`;
  const currentProgress = S.adventure.areaProgress?.[currentAreaKey] || S.adventure.areaProgress?.[legacyCurrentAreaKey] || { kills: 0, bossDefeated: false };
  const killsDisplay = document.getElementById('killsRequired');
  if (killsDisplay && currentArea) {
    killsDisplay.textContent = `${currentProgress.kills}/${currentArea.killReq}`;
  }
}
