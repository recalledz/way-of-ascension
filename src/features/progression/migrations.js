import { checkLawUnlocks } from './mutators.js';

export function ensureLaws(root){
  if(!root.laws){
    root.laws = {
      selected: null,
      unlocked: [],
      points: 0,
      trees: {
        sword: {},
        formation: {},
        alchemy: {},
      },
    };
  }
  if(typeof checkLawUnlocks === 'function'){
    checkLawUnlocks(root);
  }
}

export const migrations = [
  save => {
    ensureLaws(save);
    if(!save.cultivation){
      save.cultivation = {
        talent: 1.0,
        comprehension: 1.0,
        foundationMult: 1.0,
        pillMult: 1.0,
        buildingMult: 1.0,
      };
    }
    if(typeof save.qiCapMult === 'undefined'){
      save.qiCapMult = 0;
    }
    if(typeof save.qiRegenMult === 'undefined'){
      save.qiRegenMult = 0;
    }
  }
];
