import { featureFlags } from '../../config.js';
import { selectProgress } from '../../shared/selectors/index.js';

export const LawFeature = {
  key: 'law',
  initialState: () => ({ _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.law && selectProgress.isQiRefiningReached(root);
    },
  },
};

