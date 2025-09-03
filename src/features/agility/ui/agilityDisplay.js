import { getAgilityLevel, getAgilityExp, getAgilityExpMax, getObstacleCourses } from '../selectors.js';
import { getAgilityEffects } from '../logic.js';
import { buildObstacleCourse } from '../mutators.js';
import { setText, setFill } from '../../../shared/utils/dom.js';

export function mountAgilityUI(state){
  const startBtn = document.getElementById('startAgilityActivity');
  if(startBtn){
    startBtn.onclick = () => state.activities?.agility ? globalThis.stopActivity('agility') : globalThis.startActivity('agility');
  }
  const buildBtn = document.getElementById('buildObstacleBtn');
  if(buildBtn){
    buildBtn.onclick = () => { buildObstacleCourse(state); updateAgilityUI(state); };
  }
  updateAgilityUI(state);
}

export function updateAgilityUI(state){
  setText('agilityLevelActivity', getAgilityLevel(state));
  setText('agilityExpActivity', Math.floor(getAgilityExp(state)));
  setText('agilityExpMaxActivity', getAgilityExpMax(state));
  setFill('agilityFillActivity', getAgilityExp(state) / getAgilityExpMax(state));
  const courses = getObstacleCourses(state);
  setText('agilityObstacleCount', courses);
  setText('agilityXpBonus', `${courses * 10}%`);
  const effects = getAgilityEffects(state);
  setText('currentAgilityStat', state.stats?.agility || 10);
  setText('agilityAccuracyStat', `+${effects.accuracyBonus}`);
  setText('agilityDodgeStat', `+${effects.dodgeBonus}`);
  setText('agilityForgeStat', `+${Math.round(effects.forgeSpeed * 100)}%`);
  const startBtn = document.getElementById('startAgilityActivity');
  if(startBtn){
    startBtn.textContent = state.activities?.agility ? '🛑 Stop Training' : '🏃 Start Training';
  }
}
