import { on } from '../../../shared/events.js';
import { setText, log } from '../../../shared/utils/dom.js';
import { startTrainingSession, hitTrainingTarget, trainAgility, moveTrainingCursor } from '../mutators.js';
import {
  getAgilityLevel,
  getAgilityExp,
  getAgilityExpMax,
  getAgilityStamina,
  getAgilityMaxStamina,
  getTrainingSessionStats,
  getTrainingCursorPosition,
  isAgilityTraining
} from '../selectors.js';

function render(state){
  setText('agilityLevelActivity', getAgilityLevel(state));
  setText('agilityExpActivity', Math.floor(getAgilityExp(state)));
  setText('agilityExpMaxActivity', getAgilityExpMax(state));
  setText('agilityCurrentStamina', Math.floor(getAgilityStamina(state)));
  setText('agilityMaxStamina', getAgilityMaxStamina(state));

  const agilityFillActivity = document.getElementById('agilityFillActivity');
  if(agilityFillActivity){
    const expPercent = getAgilityExp(state) / getAgilityExpMax(state) * 100;
    agilityFillActivity.style.width = expPercent + '%';
  }

  const staminaFill = document.getElementById('agilityStaminaFill');
  if(staminaFill){
    const staminaPercent = getAgilityStamina(state) / getAgilityMaxStamina(state) * 100;
    staminaFill.style.width = staminaPercent + '%';
  }

  const session = getTrainingSessionStats(state);
  const active = isAgilityTraining(state);
  const sessionControls = document.getElementById('agilitySessionControls');
  const trainingGame = document.getElementById('agilityTrainingGame');
  if(sessionControls && trainingGame){
    if(active){
      sessionControls.style.display = 'none';
      trainingGame.style.display = 'block';
      setText('agilitySessionStamina', Math.floor(session.sessionStamina));
      setText('agilitySessionHits', session.sessionHits);
      setText('agilitySessionXP', Math.floor(session.sessionXP));
    }else{
      sessionControls.style.display = 'block';
      trainingGame.style.display = 'none';
    }
  }

  // Start cursor animation if a session is active
  if(active && cursorAnimFrame === null){
    startCursorAnimation(state);
  }

  const startSessionBtn = document.getElementById('startAgilityTrainingSession');
  if(startSessionBtn){
    const canStart = getAgilityStamina(state) >= 20;
    startSessionBtn.disabled = !canStart;
    startSessionBtn.textContent = canStart ? '🚀 Start Training Session' : '😴 Need 20+ Stamina';
  }

  const cursor = document.getElementById('agilityTimingCursor');
  if(cursor){
    cursor.style.left = getTrainingCursorPosition(state) + '%';
  }

  const startBtn = document.getElementById('startAgilityActivity');
  if(startBtn){
    startBtn.textContent = state.activities?.agility ? '🛑 Stop Training' : '🏃 Start Training';
    startBtn.onclick = () => state.activities?.agility ? globalThis.stopActivity('agility') : globalThis.startActivity('agility');
  }
}

function showHitFeedback(message, color){
  const el = document.getElementById('agilityHitFeedback');
  if(el){
    el.textContent = message;
    el.style.color = color;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 500);
  }
}

let cursorAnimFrame = null;
let lastFrameTime = 0;
let animState;

function animateCursor(timestamp){
  if(!isAgilityTraining(animState)){
    cursorAnimFrame = null;
    return;
  }
  const dt = lastFrameTime ? (timestamp - lastFrameTime) / 1000 : 0;
  lastFrameTime = timestamp;
  moveTrainingCursor(animState, dt);
  const cursor = document.getElementById('agilityTimingCursor');
  if(cursor){
    cursor.style.left = getTrainingCursorPosition(animState) + '%';
  }
  cursorAnimFrame = requestAnimationFrame(animateCursor);
}

function startCursorAnimation(state){
  animState = state;
  lastFrameTime = performance.now();
  cursorAnimFrame = requestAnimationFrame(animateCursor);
}

export function mountAgilityTrainingUI(state){
  const cardIds = ['agilityActiveTrainingCard', 'agilityEffectsCard', 'agilityCoursesCard'];
  for (const id of cardIds) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  }

  const startBtn = document.getElementById('startAgilityTrainingSession');
  if(startBtn){
    startBtn.addEventListener('click', () => {
      if(startTrainingSession(state)){
        log('Agility session started! Hit the perfect zone for maximum XP!', 'good');
        startCursorAnimation(state);
        render(state);
      }
    });
  }

  const hitBtn = document.getElementById('agilityHitButton');
  if(hitBtn){
    hitBtn.addEventListener('click', () => {
      const { message, color } = hitTrainingTarget(state);
      showHitFeedback(message, color);
    });
  }

  const dummyBtn = document.getElementById('trainAgilityBtn');
  if(dummyBtn){
    dummyBtn.addEventListener('click', () => {
      const res = trainAgility(state);
      if(res?.message) log(res.message, res.type);
    });
  }

  on('RENDER', () => render(state));
  render(state);
}

