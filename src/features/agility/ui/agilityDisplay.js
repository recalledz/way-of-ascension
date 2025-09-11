import { on } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';
import { getAgilityBonuses, getObstacleCourses } from '../selectors.js';
import { buildObstacleCourse } from '../mutators.js';

function render(state){
  const bonuses = getAgilityBonuses(state);
  setText('currentAgilityStat', state.attributes?.agility || 10);
  setText('agilityAccuracyStat', `+${bonuses.accuracyBonus}`);
  setText('agilityDodgeStat', `+${bonuses.dodgeBonus}`);
  setText('agilityForgeSpeedStat', `+${Math.floor((bonuses.forgeSpeed - 1) * 100)}%`);
  const courses = getObstacleCourses(state);
  setText('obstacleCourseCount', courses);
  setText('agilityXpMult', `+${courses * 10}% XP`);
  const nextStone = Math.floor(50 * Math.pow(1.5, courses));
  const nextWood = Math.floor(50 * Math.pow(1.5, courses));
  setText('obstacleCourseCost', `${nextStone} stone, ${nextWood} wood`);
}

export function mountAgilityUI(state){
  const buildBtn = document.getElementById('buildObstacleCourse');
  if(buildBtn){
    buildBtn.addEventListener('click', () => {
      if(buildObstacleCourse(state)){
        render(state);
      }
    });
  }
  on('RENDER', () => render(state));
  render(state);
}
