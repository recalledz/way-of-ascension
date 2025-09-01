import { S } from '../../../shared/state.js';
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

let lastBarHTML = '';
export function updateAdventureProgressBar(selectAreaById) {
  if (!S.adventure) return;
  const progressBar = document.getElementById('adventureProgressBar');
  if (!progressBar) return;
  const currentZoneId = ZONES[S.adventure.selectedZone || 0]?.id;
  const currentZone = getZoneById(currentZoneId);
  if (!currentZone || !currentZone.areas) return;
  const segmentData = [];
  let html = '';
  currentZone.areas.forEach((area, index) => {
    const areaKey = `${currentZoneId}-${area.id}`;
    const legacyAreaKey = `${S.adventure.selectedZone}-${index}`;
    const isUnlocked = isAreaUnlocked(currentZoneId, area.id, S) || S.adventure.unlockedAreas?.[legacyAreaKey] || false;
    const isCurrent = index === (S.adventure.currentArea || 0) && (S.adventure.selectedZone === S.adventure.currentZone);
    const progress = S.adventure.areaProgress?.[areaKey] || S.adventure.areaProgress?.[legacyAreaKey] || { kills: 0, bossDefeated: false };
    const classes = ['progress-segment'];
    let content = '';
    if (isUnlocked) {
      classes.push('unlocked');
      content = area.name.split(' ')[0];
      if (progress.bossDefeated) content += ' ✓';
    } else {
      classes.push('locked');
      content = '<span class="lock-icon">🔒</span>';
    }
    if (isCurrent) classes.push('current');
    html += `<div class="${classes.join(' ')}" aria-label="${area.name}: ${isUnlocked ? `${progress.kills}/${area.killReq} kills` : 'Locked'}" ${isUnlocked ? 'style="background: linear-gradient(135deg,' + currentZone.color + '88,' + currentZone.color + 'cc); border-color: ' + currentZone.color + ';"' : ''}>${content}${isCurrent ? '<div class="player-icon">🪷</div>' : ''}</div>`;
    segmentData.push({ area, index, isUnlocked });
  });
  if (html !== lastBarHTML) {
    lastBarHTML = html;
    progressBar.innerHTML = html;
    Array.from(progressBar.children).forEach((segment, i) => {
      const { area, index, isUnlocked } = segmentData[i];
      segment.addEventListener('mouseenter', (e) => {
        const areaKey = `${currentZoneId}-${area.id}`;
        const legacyAreaKey = `${S.adventure.selectedZone}-${index}`;
        const progress = S.adventure.areaProgress?.[areaKey] || S.adventure.areaProgress?.[legacyAreaKey] || { kills: 0, bossDefeated: false };
        showTooltip(e, area, progress);
      });
      segment.addEventListener('mouseleave', hideTooltip);
      if (isUnlocked) {
        segment.style.cursor = 'pointer';
        segment.setAttribute('tabindex', '0');
        segment.setAttribute('role', 'button');
        segment.addEventListener('click', () => selectAreaById(currentZoneId, area.id, index));
      }
    });
  }
  const currentArea = currentZone.areas[S.adventure.currentArea || 0];
  const currentAreaKey = `${currentZoneId}-${currentArea?.id}`;
  const legacyCurrentAreaKey = `${S.adventure.currentZone}-${S.adventure.currentArea}`;
  const currentProgress = S.adventure.areaProgress?.[currentAreaKey] || S.adventure.areaProgress?.[legacyCurrentAreaKey] || { kills: 0, bossDefeated: false };
  const killsDisplay = document.getElementById('killsRequired');
  if (killsDisplay && currentArea) {
    killsDisplay.textContent = `${currentProgress.kills}/${currentArea.killReq}`;
  }
}
