import { catchingState } from './state.js';
import { featureFlags } from '../../config.js';
import { selectAstral } from '../../shared/selectors.js';

export const CatchingFeature = {
  key: 'catching',
  initialState: () => ({ ...catchingState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.catching && selectAstral.isNodeUnlocked(4062, root);
    },
  },
};

