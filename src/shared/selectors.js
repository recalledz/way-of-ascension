import { S } from './state.js';
import { getBuildingLevel } from '../features/sect/selectors.js';

export const selectProgress = {
  mortalStage: (state = S) => {
    const tier = state.realm?.tier ?? 0;
    const stage = state.realm?.stage ?? 1;
    return tier === 0 ? stage : Infinity;
  },
  isQiRefiningReached: (state = S) => (state.realm?.tier ?? 0) >= 1,
};

export const selectAstral = {
  isNodeUnlocked: (id, state = S) => {
    const nodes = state.astralNodes || [];
    return nodes.includes(Number(id));
  },
};

export const selectSect = {
  isBuildingBuilt: (key, state = S) => getBuildingLevel(key, state) > 0,
};

export * from '../features/ability/selectors.js';
export * from '../features/adventure/selectors.js';
export * from '../features/affixes/selectors.js';
export * from '../features/alchemy/selectors.js';
export * from '../features/combat/selectors.js';
export * from '../features/cooking/selectors.js';
export * from '../features/inventory/selectors.js';
export * from '../features/karma/selectors.js';
export * from '../features/loot/selectors.js';
export * from '../features/mining/selectors.js';
export * from '../features/physique/selectors.js';
export * from '../features/proficiency/selectors.js';
export * from '../features/progression/selectors.js';
export * from '../features/sect/selectors.js';
export * from '../features/weaponGeneration/selectors.js';
