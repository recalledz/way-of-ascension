import { on } from '../shared/events.js';
import { OBJECTIVES } from '../features/tutorial/objectives.js';
import { mountAllFeatureUIs } from '../features/index.js';

export function mountTutorialBox(state) {
  if (document.getElementById('tutorialOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'tutorialOverlay';
  overlay.className = 'tutorial-overlay';
  overlay.innerHTML = `
    <div class="tutorial-card">
      <h3 id="tutorialTitle"></h3>
      <p id="tutorialText"></p>
      <p id="tutorialReq" class="muted"></p>
      <p id="tutorialReward" class="muted"></p>
      <div class="tutorial-actions">
        <button id="tutorialClaim" disabled>Claim Reward</button>
        <button id="tutorialClose">Close</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const titleEl = overlay.querySelector('#tutorialTitle');
  const textEl = overlay.querySelector('#tutorialText');
  const reqEl = overlay.querySelector('#tutorialReq');
  const rewardEl = overlay.querySelector('#tutorialReward');
  const claimBtn = overlay.querySelector('#tutorialClaim');
  const closeBtn = overlay.querySelector('#tutorialClose');

  let visible = true;
  let prevClaimable = state.tutorial?.claimable;

  function updateObjectiveDisplay() {
    const objEl = document.getElementById('currentObjective');
    const t = state.tutorial;
    const obj = OBJECTIVES[t.step];
    if (!objEl) return;
    if (visible || !obj) {
      objEl.textContent = '';
      return;
    }
    objEl.textContent = obj.title;
  }

  function applyHighlight(sel) {
    document.querySelectorAll('.objective-highlight')
      .forEach(el => el.classList.remove('objective-highlight'));
    if (sel) {
      const el = document.querySelector(sel);
      if (el) el.classList.add('objective-highlight');
    }
  }

  function render() {
    const t = state.tutorial;
    const obj = OBJECTIVES[t.step];
    if (!t || t.completed || !obj) {
      overlay.style.display = 'none';
      applyHighlight(null);
      const objEl = document.getElementById('currentObjective');
      if (objEl) objEl.textContent = '';
      return;
    }

    if (!visible && t.claimable && !prevClaimable) {
      visible = true;
    }
    prevClaimable = t.claimable;

    if (visible) {
      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }

    titleEl.textContent = obj.title;
    textEl.textContent = obj.text;
    reqEl.textContent = obj.reqText;
    rewardEl.textContent = obj.rewardText;
    claimBtn.disabled = !t.claimable;

    updateObjectiveDisplay();
    applyHighlight(obj.highlight);
  }

  claimBtn.addEventListener('click', () => {
    const t = state.tutorial;
    const obj = OBJECTIVES[t.step];
    if (!obj || !t.claimable) return;
    obj.reward(state);
    mountAllFeatureUIs(state);
    t.step += 1;
    t.claimable = false;
    if (!OBJECTIVES[t.step]) {
      t.completed = true;
      visible = false;
    }
    render();
  });

  closeBtn.addEventListener('click', () => {
    visible = false;
    render();
  });

  on('RENDER', render);
  render();
}
