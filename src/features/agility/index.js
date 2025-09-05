import { agilityState } from './state.js';
import { featureFlags } from '../../config.js';
import { selectAstral } from '../../shared/selectors/index.js';

export const AgilityFeature = {
  key: 'agility',
  initialState: () => ({ ...agilityState, _v: 0 }),
  nav: {
    visible() {
      return featureFlags.agility && selectAstral.isNodeUnlocked(4062);
    },
  },
};
