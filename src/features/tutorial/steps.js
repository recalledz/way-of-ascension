import { fCap, realmStage } from '../progression/selectors.js';

export const STEPS = [
  {
    title: 'Journey to immortality',
    text: 'Begin your practice by pressing the start cultivating button. While cultivating, you will gain foundation, which will accumulate until reaching max. Once you reach max you will be able to attempt breakthrough.',
    req: 'Objective: Reach 100% foundation on stage 1.',
    reward: 'Reward: 1 breakthrough pill.',
    highlight: 'startCultivationActivity',
    check(state) {
      return state.foundation >= fCap(state) * 0.99;
    },
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
    check(state) {
      return realmStage(state) >= 2;
    },
    applyReward(state) {
      state.astralPoints = (state.astralPoints || 0) + 50;
      const btn = document.getElementById('openAstralTree');
      if (btn) btn.style.display = 'block';
    },
  },
];
