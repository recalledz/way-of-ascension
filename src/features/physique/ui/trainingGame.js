import { on } from '../../../shared/events.js';
import { setText, log } from '../../../shared/utils/dom.js';
import { startTrainingSession, hitTrainingTarget, trainPhysique } from '../mutators.js';
import {
  getPhysiqueLevel,
  getPhysiqueExp,
  getPhysiqueExpMax,
  getPhysiqueStamina,
  getPhysiqueMaxStamina,
  getTrainingSessionStats,
  getTrainingCursorPosition,
  isPhysiqueTraining
} from '../selectors.js';

function render(state){
  setText('physiqueLevelActivity', getPhysiqueLevel(state));
  setText('physiqueExpActivity', Math.floor(getPhysiqueExp(state)));
  setText('physiqueExpMaxActivity', getPhysiqueExpMax(state));
  setText('currentStamina', Math.floor(getPhysiqueStamina(state)));
  setText('maxStamina', getPhysiqueMaxStamina(state));

  const physiqueFillActivity = document.getElementById('physiqueFillActivity');
  if(physiqueFillActivity){
    const expPercent = getPhysiqueExp(state) / getPhysiqueExpMax(state) * 100;
    physiqueFillActivity.style.width = expPercent + '%';
  }

  const staminaFill = document.getElementById('staminaFill');
  if(staminaFill){
    const staminaPercent = getPhysiqueStamina(state) / getPhysiqueMaxStamina(state) * 100;
    staminaFill.style.width = staminaPercent + '%';
  }

  const session = getTrainingSessionStats(state);
  const active = isPhysiqueTraining(state);
  const sessionControls = document.getElementById('sessionControls');
  const trainingGame = document.getElementById('trainingGame');
  if(sessionControls && trainingGame){
    if(active){
      sessionControls.style.display = 'none';
      trainingGame.style.display = 'block';
      setText('sessionStamina', Math.floor(session.sessionStamina));
      setText('sessionHits', session.sessionHits);
      setText('sessionXP', Math.floor(session.sessionXP));
    }else{
      sessionControls.style.display = 'block';
      trainingGame.style.display = 'none';
    }
  }

  const startSessionBtn = document.getElementById('startTrainingSession');
  if(startSessionBtn){
    const canStart = getPhysiqueStamina(state) >= 20;
    startSessionBtn.disabled = !canStart;
    startSessionBtn.textContent = canStart ? '🚀 Start Training Session' : '😴 Need 20+ Stamina';
  }

  const passiveRate = (2 + (getPhysiqueLevel(state) * 0.2)) / 3;
  setText('passiveTrainingRate', `+${passiveRate.toFixed(1)} XP/sec`);
  setText('passiveXpGained', `${Math.floor(state.physique.passiveXpGained || 0)} XP`);

  const cursor = document.getElementById('timingCursor');
  if(cursor){
    cursor.style.left = getTrainingCursorPosition(state) + '%';
  }

  const startBtn = document.getElementById('startPhysiqueActivity');
  if(startBtn){
    startBtn.textContent = state.activities?.physique ? '🛑 Stop Training' : '💪 Start Training';
    startBtn.onclick = () => state.activities?.physique ? globalThis.stopActivity('physique') : globalThis.startActivity('physique');
  }
}

function showHitFeedback(message, color){
  const el = document.getElementById('hitFeedback');
  if(el){
    el.textContent = message;
    el.style.color = color;
    el.style.opacity = '1';
    const start = performance.now();
    const fade = (now) => {
      if (now - start >= 500) {
        el.style.opacity = '0';
      } else {
        requestAnimationFrame(fade);
      }
    };
    requestAnimationFrame(fade);
  }
}

export function mountTrainingGameUI(state){
  const startBtn = document.getElementById('startTrainingSession');
  if(startBtn){
    startBtn.addEventListener('click', () => {
      if(startTrainingSession(state)){
        log('Training session started! Hit the perfect zone for maximum XP!', 'good');
      }
    });
  }

  const hitBtn = document.getElementById('hitButton');
  if(hitBtn){
    hitBtn.addEventListener('click', () => {
      const { message, color } = hitTrainingTarget(state);
      showHitFeedback(message, color);
    });
  }

  const dummyBtn = document.getElementById('trainDummyBtn');
  if(dummyBtn){
    dummyBtn.addEventListener('click', () => {
      const res = trainPhysique(state);
      if(res?.message) log(res.message, res.type);
    });
  }

  on('RENDER', () => render(state));
  render(state);
}

