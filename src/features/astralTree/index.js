import { featureFlags } from '../../config.js';
import { selectProgress } from '../../shared/selectors/index.js';

export const AstralTreeFeature = {
  key: 'astralTree',
  initialState: () => ({ _v: 0 }),
  nav: {
    visible(root) {
      return featureFlags.astralTree && selectProgress.mortalStage(root) >= 2;
    },
  },
};

