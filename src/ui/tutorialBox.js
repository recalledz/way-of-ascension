import { on } from '../shared/events.js';
import { STEPS } from '../features/tutorial/steps.js';

export function mountTutorialBox(state) {
  if (document.getElementById('tutorialOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'tutorialOverlay';
  overlay.className = 'modal-overlay';
  overlay.style.display = 'none';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const card = document.createElement('div');
  card.className = 'modal-content tutorial-card';

  const header = document.createElement('div');
  header.className = 'card-header';
  const titleEl = document.createElement('h4');
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn small ghost';
  closeBtn.textContent = '×';
  header.appendChild(titleEl);
  header.appendChild(closeBtn);
  card.appendChild(header);

  const bodyEl = document.createElement('p');
  const reqEl = document.createElement('p');
  const rewardEl = document.createElement('p');
  rewardEl.className = 'reward';
  const claimBtn = document.createElement('button');
  claimBtn.id = 'claimTutorialReward';
  claimBtn.className = 'btn primary';
  claimBtn.textContent = 'Claim Reward';
  claimBtn.disabled = true;
  card.append(bodyEl, reqEl, rewardEl, claimBtn);

  overlay.append(backdrop, card);
  document.body.appendChild(overlay);

  function renderObjective() {
    const el = document.getElementById('currentObjective');
    const label = document.getElementById('currentObjectiveLabel');
    if (!el || !label) return;
    if (state.tutorial.completed) {
      el.style.display = 'none';
      label.style.display = 'none';
      return;
    }
    const step = STEPS[state.tutorial.step];
    if (!step) return;
    el.textContent = step.title;
    el.style.display = 'block';
    label.style.display = 'block';
  }

  function updateHighlight() {
    STEPS.forEach(s => {
      document.getElementById(s.highlight)?.classList.remove('tutorial-highlight');
    });
    if (state.tutorial.completed) return;
    const step = STEPS[state.tutorial.step];
    if (!step) return;
    document.getElementById(step.highlight)?.classList.add('tutorial-highlight');
  }

  function render() {
    const t = state.tutorial;
    if (!t) return;
    if (t.completed) {
      overlay.style.display = 'none';
      updateHighlight();
      renderObjective();
      return;
    }
    if (t.showOverlay) {
      const step = STEPS[t.step];
      if (step) {
        titleEl.textContent = step.title;
        bodyEl.textContent = step.text;
        reqEl.textContent = step.req;
        rewardEl.textContent = step.reward;
      }
      claimBtn.disabled = !t.rewardReady;
      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }
    updateHighlight();
    renderObjective();
  }

  const objectiveEl = document.getElementById('currentObjective');
  if (objectiveEl) {
    const openOverlay = () => {
      state.tutorial.showOverlay = true;
      render();
    };
    objectiveEl.addEventListener('click', openOverlay);
    objectiveEl.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openOverlay();
      }
    });
  }

  function closeOverlay() {
    state.tutorial.showOverlay = false;
    render();
  }

  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);

  claimBtn.addEventListener('click', () => {
    const t = state.tutorial;
    if (!t.rewardReady) return;
    const step = STEPS[t.step];
    step.applyReward?.(state);
    t.step++;
    t.rewardReady = false;
    if (t.step >= STEPS.length) {
      t.completed = true;
      t.showOverlay = false;
    } else {
      t.showOverlay = true;
    }
    render();
  });

  on('RENDER', render);
  render();
}

