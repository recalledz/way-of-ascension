import { forgingState } from './state.js';
import { featureFlags } from '../../config.js';
import { selectAstral } from '../../shared/selectors.js';

export const ForgingFeature = {
  key: 'forging',
  initialState: () => ({ ...forgingState, _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.forging && selectAstral.isNodeUnlocked(4062, root);
    },
  },
};
