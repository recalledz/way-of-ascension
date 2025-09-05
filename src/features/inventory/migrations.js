import { WEAPONS } from '../weaponGeneration/data/weapons.js';
import { GEAR_BASES } from '../gearGeneration/data/gearBases.js';

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
      save.equipment = { mainhand: { key: 'fist', type: 'weapon' }, head: null, body: null, foot: null, ring1: null, ring2: null, talisman1: null, talisman2: null, food: null };
    } else {
      if (!save.equipment.mainhand) save.equipment.mainhand = { key: 'fist', type: 'weapon' };
      if (typeof save.equipment.head === 'undefined') save.equipment.head = null;
      if (typeof save.equipment.body === 'undefined') {
        if (typeof save.equipment.torso !== 'undefined') {
          save.equipment.body = save.equipment.torso;
          delete save.equipment.torso;
        } else {
          save.equipment.body = null;
        }
      } else if (typeof save.equipment.torso !== 'undefined') {
        delete save.equipment.torso;
      }
      if (typeof save.equipment.foot === 'undefined') save.equipment.foot = null;
      if (typeof save.equipment.ring1 === 'undefined') save.equipment.ring1 = null;
      if (typeof save.equipment.ring2 === 'undefined') save.equipment.ring2 = null;
      if (typeof save.equipment.talisman1 === 'undefined') save.equipment.talisman1 = null;
      if (typeof save.equipment.talisman2 === 'undefined') save.equipment.talisman2 = null;
      if (typeof save.equipment.food === 'undefined') save.equipment.food = null;
    }
    if (!Array.isArray(save.sessionLoot)) save.sessionLoot = [];
  },
  save => {
    if (!save.shield) save.shield = { current: 0, max: 0 };
    if (typeof save.autoFillShieldFromQi === 'undefined') save.autoFillShieldFromQi = true;
    if (save.shield.current > save.shield.max) save.shield.current = save.shield.max;
  },
  save => {
    if (!Array.isArray(save.inventory)) save.inventory = [];
    const hasPalmWraps = save.inventory.some(it => (typeof it === 'string' ? it === 'palmWraps' : it.key === 'palmWraps'));
    const equippedPalm = typeof save.equipment?.mainhand === 'object' && save.equipment.mainhand?.key === 'palmWraps';
    if (!hasPalmWraps && !equippedPalm) {
      save.inventory.push({ id: Date.now() + Math.random(), key: 'palmWraps', name: 'Palm Wraps', type: 'weapon' });
    }
  },
  save => {
    if (typeof save.coin === 'undefined') save.coin = 0;
    if (!Array.isArray(save.junk)) save.junk = [];
  },
  save => {
    if (!Array.isArray(save.inventory)) save.inventory = [];
    save.inventory.forEach(it => {
      if (it && typeof it === 'object' && !it.name && it.key) {
        it.name =
          WEAPONS[it.key]?.displayName ||
          GEAR_BASES[it.key]?.displayName ||
          it.key;
      }
    });
    if (save.equipment && typeof save.equipment === 'object') {
      Object.values(save.equipment).forEach(it => {
        if (it && typeof it === 'object' && !it.name && it.key) {
          it.name =
            WEAPONS[it.key]?.displayName ||
            GEAR_BASES[it.key]?.displayName ||
            it.key;
        }
      });
    }
    const hasPalmWraps = save.inventory.some(it =>
      typeof it === 'string' ? it === 'palmWraps' : it.key === 'palmWraps'
    );
    const equippedPalm =
      typeof save.equipment?.mainhand === 'object' &&
      save.equipment.mainhand?.key === 'palmWraps';
    if (!hasPalmWraps && !equippedPalm) {
      save.inventory.push({
        id: Date.now() + Math.random(),
        key: 'palmWraps',
        name: 'Palm Wraps',
        type: 'weapon'
      });
    }
  }
];
