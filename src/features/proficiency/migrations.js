import { WEAPON_TYPES } from '../weaponGeneration/data/weaponTypes.js';

export const migrations = [
  save => {
    if(!save.proficiency){
      if(save.proficiencies){
        save.proficiency = {};
        for(const [k,v] of Object.entries(save.proficiencies)){
          save.proficiency[k] = typeof v === 'object' ? (v.level || 0) : v;
        }
        delete save.proficiencies;
      }else{
        save.proficiency = {};
      }
    }
  },
  save => {
    if (save.proficiency && typeof save.proficiency === 'object') {
      const converted = {};
      for (const [key, val] of Object.entries(save.proficiency)) {
        const type = WEAPON_TYPES[key];
        const classKey = type?.classKey || key;
        converted[classKey] = (converted[classKey] || 0) + val;
      }
      save.proficiency = converted;
    }
  }
];
