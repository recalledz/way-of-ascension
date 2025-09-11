import { ZONES } from '../adventure/data/zones.js';
import { getCatchingIcon } from './data/icons.js';
import { startActivity as startActivityMut } from '../activity/mutators.js';
function getRoot(state){
  return state.catching || state;
}

export function startCatch(state, zi, ai){
  const root = getRoot(state);
  if(root.currentCatch) return false;
  if((root.nets ?? 0) <= 0) return false;
  const zone = ZONES[zi];
  const area = zone?.areas?.[ai];
  if(!area) return false;
  const stage = ai + 1;
  const chance = Math.pow(0.5, stage);
  const baseMinutes = 10 + 5 * stage;
  const agility = state.attributes?.agility || 0;
  const duration = baseMinutes * 60_000 * Math.max(0, 1 - 0.04 * agility);
  const icon = getCatchingIcon(area.enemy);
  root.nets -= 1;
  root.currentCatch = { start: Date.now(), duration, chance, stage, area, enemy: area.enemy, icon, progress: 0 };
  startActivityMut(state, 'catching');
  return true;
}
