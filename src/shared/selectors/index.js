import { S } from '../state.js';
import { getBuildingLevel } from '../../features/sect/selectors.js';

const ASTRAL_STORAGE_KEY = 'astralTreeAllocated';

export const selectProgress = {
  mortalStage(state = S) {
    return state.realm.tier === 0 ? state.realm.stage : Infinity;
  },
  isQiRefiningReached(state = S) {
    return state.realm.tier >= 1;
  }
};

export const selectAstral = {
  isNodeUnlocked(id) {
    try {
      const arr = JSON.parse(localStorage.getItem(ASTRAL_STORAGE_KEY) || '[]');
      return arr.includes(id);
    } catch {
      return false;
    }
  }
};

const buildingKeyMap = { alchemy: 'alchemy_lab' };

export const selectSect = {
  isBuildingBuilt(key, state = S) {
    const actual = buildingKeyMap[key] || key;
    return getBuildingLevel(actual, state) > 0;
  }
};

export * from '../../features/ability/selectors.js';
export * from '../../features/adventure/selectors.js';
export * from '../../features/affixes/selectors.js';
export * from '../../features/alchemy/selectors.js';
export * from '../../features/combat/selectors.js';
export * from '../../features/cooking/selectors.js';
export * from '../../features/inventory/selectors.js';
export * from '../../features/karma/selectors.js';
export * from '../../features/loot/selectors.js';
export * from '../../features/mining/selectors.js';
export * from '../../features/physique/selectors.js';
export * from '../../features/proficiency/selectors.js';
export * from '../../features/progression/selectors.js';
export * from '../../features/sect/selectors.js';
export * from '../../features/weaponGeneration/selectors.js';

