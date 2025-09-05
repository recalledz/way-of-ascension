import { forgingState } from './state.js';

export const ForgingFeature = {
  key: 'forging',
  initialState: () => ({ ...forgingState, _v: 0 }),
};
