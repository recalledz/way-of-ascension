import { forgingState } from './state.js';
import { featureFlags } from '../../config.js';

export const ForgingFeature = {
  key: 'forging',
  initialState: () => ({ ...forgingState, _v: 0 }),
  nav: {
    visible() {
      return featureFlags.forging && true;
    },
  },
};
