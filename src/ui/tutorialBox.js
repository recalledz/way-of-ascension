import { on } from '../shared/events.js';

const STEPS = [
  {
    title: 'Journey to immortality',
    text: 'Begin your practice by pressing the start cultivating button. While cultivating, you will gain foundation, which will accumulate until reaching max. Once you reach max you will be able to attempt breakthrough.',
    req: 'Objective: Reach 100% foundation on stage 1.',
    reward: 'Reward: 1 breakthrough pill.',
    highlight: 'startCultivationActivity',
    applyReward(state) {
      state.pills = state.pills || { qi: 0, body: 0, ward: 0 };
      state.pills.ward = (state.pills.ward || 0) + 1;
    },
  },
  {
    title: 'Breakthrough to stage 2',
    text: 'When enough foundation in practice has been gained, you can attempt to ascend to higher states of being. This is called a breakthrough, and only the boldest of spirit may attempt to pursue. Every breakthrough has a chance to be succesfull. However, there are ways to increase this that will become available as you progress. Each breakthrough is more difficult than the previous one. A breakthrough pill will help in increasing odds',
    req: 'Objective: Attempt breakthrough. Breakthrough chances can be viewed in the "stats" sub tab in cultivation.',
    reward: 'Reward: Unlock astral tree. 50 insight.',
    highlight: 'breakthroughBtnActivity',
    applyReward(state) {
      state.astralPoints = (state.astralPoints || 0) + 50;
      const btn = document.getElementById('openAstralTree');
      if (btn) btn.style.display = 'block';
    },
  },
];

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
    if (!el) return;
    if (state.tutorial.completed) {
      el.style.display = 'none';
      return;
    }
    const step = STEPS[state.tutorial.step];
    el.textContent = step.title;
    el.style.display = 'block';
  }

  function updateHighlight() {
    ['startCultivationActivity', 'breakthroughBtnActivity'].forEach(id => {
      document.getElementById(id)?.classList.remove('tutorial-highlight');
    });
    if (state.tutorial.completed) return;
    const id = STEPS[state.tutorial.step].highlight;
    document.getElementById(id)?.classList.add('tutorial-highlight');
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
      titleEl.textContent = step.title;
      bodyEl.textContent = step.text;
      reqEl.textContent = step.req;
      rewardEl.textContent = step.reward;
      claimBtn.disabled = !t.rewardReady;
      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }
    updateHighlight();
    renderObjective();
  }

  function closeOverlay() {
    state.tutorial.showOverlay = false;
    render();
  }

  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);

  claimBtn.addEventListener('click', () => {
    if (!state.tutorial.rewardReady) return;
    const step = STEPS[state.tutorial.step];
    step.applyReward(state);
    state.tutorial.step++;
    state.tutorial.rewardReady = false;
    if (state.tutorial.step >= STEPS.length) {
      state.tutorial.completed = true;
      state.tutorial.showOverlay = false;
    } else {
      state.tutorial.showOverlay = true;
    }
    render();
  });

  on('RENDER', render);
  render();
}

