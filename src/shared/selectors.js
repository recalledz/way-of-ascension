import { mortalStage, isQiRefiningReached, isNodeUnlocked } from '../features/progression/selectors.js';
import { isBuildingBuilt } from '../features/sect/selectors.js';

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

export const selectProgress = { mortalStage, isQiRefiningReached };
export const selectAstral = { isNodeUnlocked };
export const selectSect = { isBuildingBuilt };
