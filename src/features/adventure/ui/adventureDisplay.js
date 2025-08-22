import { S } from '../../../shared/state.js';
import { setFill, setText } from '../../../shared/utils/dom.js';
import { ZONES } from '../data/zones.js';
import { startAdventure, startAdventureCombat, startBossCombat, progressToNextArea, retreatFromCombat } from '../mutators.js';
import { updateActivityAdventure } from '../logic.js';

export function updateAdventureProgress(state = S) {
  if (!state.adventure) return;
  const currentZone = ZONES[state.adventure.currentZone];
  const currentArea = currentZone ? currentZone.areas[state.adventure.currentArea] : null;
  const location = currentArea ? currentArea.name : 'Village Outskirts';
  if (currentArea) {
    const progress = state.adventure.killsInCurrentArea / currentArea.killReq;
    setFill('adventureProgressFill', progress);
    setText('adventureProgressText', `${Math.floor(progress * 100)}%`);
  }
  setText('adventureLevel', location);
}

export function mountAdventureControls(root) {
  // Map overlay
  document.getElementById('mapButton')?.addEventListener('click', () => {
    import('./mapUI.js').then(({ showMapOverlay }) => showMapOverlay());
  });

  function startRetreatCountdown() {
    const btn = document.getElementById('startBattleButton');
    if (!root.adventure || !root.adventure.inCombat || !btn) return;
    let remaining = 5;
    btn.disabled = true;
    btn.textContent = `Retreating (${remaining})`;
    const it = setInterval(() => {
      if (root.adventure.playerHP <= 0) {
        clearInterval(it);
        btn.disabled = false;
        btn.classList.remove('warn'); btn.classList.add('primary');
        btn.textContent = '⚔️ Start Battle';
        (globalThis.stopActivity?.('adventure'));
        root.qi = 0;
        updateActivityAdventure();
        return;
      }
      remaining--;
      if (remaining > 0) {
        btn.textContent = `Retreating (${remaining})`;
      } else {
        clearInterval(it);
        retreatFromCombat();
        btn.disabled = false;
        btn.classList.remove('warn'); btn.classList.add('primary');
        btn.textContent = '⚔️ Start Battle';
        updateActivityAdventure();
      }
    }, 1000);
  }

  const startBtn = document.getElementById('startBattleButton');
  startBtn?.addEventListener('click', () => {
    if (root.adventure && root.adventure.inCombat) { startRetreatCountdown(); return; }
    startAdventure();
    if (!root.activities?.adventure && typeof globalThis.startActivity === 'function') {
      globalThis.startActivity('adventure');
    }
    startAdventureCombat();
    updateActivityAdventure();
    startBtn.textContent = '🏃 Retreat';
    startBtn.classList.remove('primary'); startBtn.classList.add('warn');
  });

  document.getElementById('progressButton')?.addEventListener('click', () => progressToNextArea());
  document.getElementById('challengeBossButton')?.addEventListener('click', () => {
    startAdventure();
    if (!root.activities?.adventure && typeof globalThis.startActivity === 'function') {
      globalThis.startActivity('adventure');
    }
    startBossCombat();
    updateActivityAdventure();
  });
}
