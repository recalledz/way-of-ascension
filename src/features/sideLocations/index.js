import { sideLocationState } from './state.js';

export const SideLocationFeature = {
  key: 'sideLocations',
  initialState: () => ({ ...sideLocationState, _v: 0 }),
  nav: {
    visible() {
      return true;
    },
  },
};
