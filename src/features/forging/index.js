import { forgingState } from './state.js';
import { selectAstral } from '../../shared/selectors.js';

export const ForgingFeature = {
  key: 'forging',
  initialState: () => ({ ...forgingState, _v: 0 }),
  nav: {
    visible(root) {
      return selectAstral.isNodeUnlocked(4062, root);
    },
  },
};
