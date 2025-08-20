import { abilityState } from '../features/ability/state.js';
import { adventureState } from '../features/adventure/state.js';
import { affixState } from '../features/affixes/state.js';
import { combatState } from '../features/combat/state.js';
import { inventoryState } from '../features/inventory/state.js';
import { lootState } from '../features/loot/state.js';
import { proficiencyState } from '../features/proficiency/state.js';
import { progressionState } from '../features/progression/state.js';
import { weaponGenerationState } from '../features/weaponGeneration/state.js';
import { runMigrations, SAVE_VERSION } from './utils/migrations.js';

function clone(obj){
  return structuredClone(obj);
}

export function loadSave(){
  try{
    const t = localStorage.getItem('woa-save');
    if(!t) return null;
    const save = JSON.parse(t);
    runMigrations(save);
    return save;
  }catch{
    return null;
  }
}

export const defaultState = () => ({
  ver: SAVE_VERSION,
  time: 0,
  ...clone(abilityState),
  ...clone(adventureState),
  ...clone(affixState),
  ...clone(combatState),
  ...clone(inventoryState),
  ...clone(lootState),
  ...clone(proficiencyState),
  ...clone(progressionState),
  ...clone(weaponGenerationState),
});

export let S = loadSave() || defaultState();

export function save(){
  try{
    S.ver = SAVE_VERSION;
    localStorage.setItem('woa-save', JSON.stringify(S));
  }catch{
    /* ignore */
  }
}

export function setState(newState){
  S = newState;
}
