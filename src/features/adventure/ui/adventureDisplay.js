import { S } from '../../../shared/state.js';
import { setFill, setText } from '../../../shared/utils/dom.js';
import { ZONES } from '../data/zones.js';

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
