import { WEAPONS } from '../../features/weaponGeneration/data/weapons.js';

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
  },
  save => {
    if(!save.inventory){
      save.inventory = { weapons: [], armor: [] };
    }else{
      if(!Array.isArray(save.inventory.weapons)) save.inventory.weapons = [];
      if(!Array.isArray(save.inventory.armor)) save.inventory.armor = [];
    }
    if(!save.equipment){
      save.equipment = { mainhand: 'fist', armor: null };
    }else if(typeof save.equipment.armor === 'undefined'){
      save.equipment.armor = null;
    }
  },
  save => {
    if (typeof save.cooking === 'undefined') {
      save.cooking = { level: 1, exp: 0, expMax: 100 };
    }
    if (save.activities && typeof save.activities.cooking === 'undefined') {
      save.activities.cooking = false;
    }
  },
  save => {
    if (!save.flags) save.flags = {};
    save.flags.weaponsEnabled = true;
    if (!Array.isArray(save.inventory)) {
      const legacy = save.inventory || {};
      save.inventory = [];
      if (Array.isArray(legacy.weapons)) {
        legacy.weapons.forEach(w => {
          const key = w.key || w;
          save.inventory.push({ id: Date.now() + Math.random(), key, type: 'weapon' });
        });
      }
      if (Array.isArray(legacy.armor)) {
        legacy.armor.forEach(a => {
          const key = a.key || a;
          save.inventory.push({ id: Date.now() + Math.random(), key, type: 'armor', slot: a.slot });
        });
      }
    }
    if (!save.equipment || typeof save.equipment !== 'object') {
      save.equipment = { mainhand: { key: 'fist', type: 'weapon' }, head: null, torso: null, food: null };
    } else {
      if (!save.equipment.mainhand) save.equipment.mainhand = { key: 'fist', type: 'weapon' };
      if (typeof save.equipment.head === 'undefined') save.equipment.head = null;
      if (typeof save.equipment.torso === 'undefined') save.equipment.torso = null;
      if (typeof save.equipment.food === 'undefined') save.equipment.food = null;
    }
    if (!Array.isArray(save.sessionLoot)) save.sessionLoot = [];
  },
  save => {
    if (save.proficiency && typeof save.proficiency === 'object') {
      const converted = {};
      for (const [key, val] of Object.entries(save.proficiency)) {
        const weapon = WEAPONS[key];
        const typeKey = weapon?.proficiencyKey || key;
        converted[typeKey] = (converted[typeKey] || 0) + val;
      }
      save.proficiency = converted;
    }
  },
  save => {
    if (!save.shield) save.shield = { current: 0, max: 0 };
    if (typeof save.autoFillShieldFromQi === 'undefined') save.autoFillShieldFromQi = true;
    if (save.shield.current > save.shield.max) save.shield.current = save.shield.max;
  },
  save => {
    if (!save.activities) {
      save.activities = {
        cultivation: false,
        physique: false,
        mining: false,
        adventure: false,
        cooking: false,
      };
    } else {
      if (typeof save.activities.cultivation === 'undefined') save.activities.cultivation = false;
      if (typeof save.activities.physique === 'undefined') save.activities.physique = false;
      if (typeof save.activities.mining === 'undefined') save.activities.mining = false;
      if (typeof save.activities.adventure === 'undefined') save.activities.adventure = false;
      if (typeof save.activities.cooking === 'undefined') save.activities.cooking = false;
    }
    if (!save.physique) {
      save.physique = { level: 1, exp: 0, expMax: 100, stamina: 100, maxStamina: 100 };
    }
    if (!save.mining) {
      save.mining = {
        level: 1,
        exp: 0,
        expMax: 100,
        unlockedResources: ['stones'],
        selectedResource: 'stones',
        resourcesGained: 0,
      };
    }
    if (!save.cooking) {
      save.cooking = { level: 1, exp: 0, expMax: 100 };
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
