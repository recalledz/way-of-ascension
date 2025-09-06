import { agilityState } from './state.js';
import { selectAstral } from '../../shared/selectors.js';

export const AgilityFeature = {
  key: 'agility',
  initialState: () => ({ ...agilityState, _v: 0 }),
  nav: {
    visible(root) {
      return selectAstral.isNodeUnlocked(4062, root);
    },
  },
};
