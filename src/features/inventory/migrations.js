export const migrations = [
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
    if (!save.shield) save.shield = { current: 0, max: 0 };
    if (typeof save.autoFillShieldFromQi === 'undefined') save.autoFillShieldFromQi = true;
    if (save.shield.current > save.shield.max) save.shield.current = save.shield.max;
  }
];
