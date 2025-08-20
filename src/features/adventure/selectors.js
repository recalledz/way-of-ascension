import { S } from '../../shared/state.js';

export const getAdventure = (state = S) => state.adventure;
export const getCurrentZoneIndex = (state = S) => state.adventure?.currentZone ?? 0;
export const getCurrentAreaIndex = (state = S) => state.adventure?.currentArea ?? 0;
export const getAreaProgress = (zoneIndex, areaIndex, state = S) =>
  state.adventure?.areaProgress?.[`${zoneIndex}-${areaIndex}`] || { kills: 0, bossDefeated: false };
