import { selectProgress } from '../../shared/selectors.js';

export const AstralTreeFeature = {
  key: 'astralTree',
  initialState: () => ({ _v: 0 }),
  nav: {
    visible(root) {
      return selectProgress.realmStage(root) >= 2;
    },
  },
};

