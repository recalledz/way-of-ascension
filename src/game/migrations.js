export const migrations = [
  save => {
    if(!save.laws){
      save.laws = {
        selected: null,
        unlocked: [],
        points: 0,
        trees: {
          sword: {},
          formation: {},
          alchemy: {}
        }
      };
    }
    if(!save.buildings){
      save.buildings = {};
    }
    if(!save.cultivation){
      save.cultivation = {
        talent: 1.0,
        comprehension: 1.0,
        foundationMult: 1.0,
        pillMult: 1.0,
        buildingMult: 1.0
      };
    }
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
    if(save.alchemy && !Object.prototype.hasOwnProperty.call(save.alchemy, 'unlocked')){
      save.alchemy.unlocked = true;
      save.alchemy.knownRecipes = ['qi', 'body', 'ward'];
    }
    if(typeof save.qiCapMult === 'undefined'){
      save.qiCapMult = 0;
    }
    if(typeof save.qiRegenMult === 'undefined'){
      save.qiRegenMult = 0;
    }
  }
];

export const SAVE_VERSION = migrations.length;

export function runMigrations(save){
  let ver = save.ver || 0;
  while(ver < migrations.length){
    migrations[ver](save);
    ver++;
  }
  save.ver = ver;
}
