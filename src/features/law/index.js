import { selectProgress } from '../../shared/selectors.js';

export const LawFeature = {
  key: 'law',
  initialState: () => ({ _v: 0 }),
  nav: {
    visible(root) {
      return selectProgress.isQiRefiningReached(root);
    },
  },
};

