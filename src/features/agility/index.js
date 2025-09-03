import { agilityState } from './state.js';

export const AgilityFeature = {
  key: 'agility',
  initialState: () => ({ ...agilityState, _v: 0 }),
};
