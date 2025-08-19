import { initHp } from './helpers.js';
import { runMigrations, SAVE_VERSION } from './migrations.js';

export function loadSave(){
  try{
    const t = localStorage.getItem('woa-save');
    if(!t) return null;
    const save = JSON.parse(t);
    runMigrations(save);
    return save;
  }catch{ return null; }
}

export const defaultState = () => {
  const { hp: enemyHP, hpMax: enemyMaxHP } = initHp(0);
  return {
  ver: SAVE_VERSION,
  time:0,
  qi: 100, qiMax: 100, qiRegenPerSec: 1,
  qiCapMult: 0, // Qi capacity multiplier from buildings/bonuses
  qiRegenMult: 0, // Qi regeneration multiplier from buildings/bonuses
  foundation: 0,
  ...initHp(100),
  shield: { current: 0, max: 0 },
  autoFillShieldFromQi: true,
  stunBar: 0, // STATUS-REFORM player stun accumulation
  realm: { tier: 0, stage: 1 },
  wood:0, cores:0,
  pills:{qi:0, body:0, ward:0},
  atkBase:5, defBase:2, tempAtk:0, tempDef:0,
  // Expanded Stat System
  stats: {
    physique: 10,        // Physical power
    mind: 10,            // Spell power, alchemy, learning speed
    agility: 10,         // Weapon handling, dodge
    dexterity: 10,       // Attack speed, cooldowns, crafting, adventure speed
    comprehension: 10,   // Foundation gain, learning speed
    criticalChance: 0.05, // Base critical hit chance
    attackSpeed: 1.0,    // Base attack speed multiplier
    cooldownReduction: 0, // Cooldown reduction percentage
    adventureSpeed: 1.0, // Adventure/exploration speed multiplier
    armor: 0            // Total armor from gear and bonuses
  },
  disciples:1,
  gather:{herbs:0, ore:0, wood:0},
  yieldMult:{herbs:0, ore:0, wood:0},
  alchemy:{level:1, xp:0, queue:[], maxSlots:1, successBonus:0, unlocked:false, knownRecipes:['qi']}, // Start with only Qi recipe
  combat:{hunt:null, cds:{slash:0,guard:0,burst:0}, guardUntil:0, techniques:{}},
  abilityCooldowns:{},
  actionQueue:[],
  bought:{},
  karmaPts:0, ascensions:0,
  karma:{qiRegen:0, yield:0, atk:0, def:0},
  // Auto systems - players now begin with meditation disabled and must
  // explicitly start cultivating via the UI.
  auto:{meditate:false, brewQi:false, hunt:false},
  // Activity System - only one can be active at a time
  activities: {
    cultivation: false,
    physique: false,
    mining: false,
    adventure: false,
    cooking: false
  },
  // Activity data containers
  physique: { level: 1, exp: 0, expMax: 100, stamina: 100, maxStamina: 100 },
  mining: {
    level: 1,
    exp: 0,
    expMax: 100,
    unlockedResources: ['stones'],
    selectedResource: 'stones',
    resourcesGained: 0
  },
  cooking: {
    level: 1,
    exp: 0,
    expMax: 100
  },
  adventure: {
    currentZone: 0,
    currentArea: 0,
    selectedZone: 0,      // Automatically select Peaceful Lands
    selectedArea: 0,      // Automatically select first area (Forest Edge)
    totalKills: 0,
    areasCompleted: 0,
    zonesUnlocked: 1,
    killsInCurrentArea: 0,
    bestiary: {},
    inCombat: false,
    playerHP: 100,
    enemyHP,
    enemyMaxHP,
    currentEnemy: null,
    lastPlayerAttack: 0,
    lastEnemyAttack: 0,
    playerStunBar: 0, // STATUS-REFORM
    enemyStunBar: 0, // STATUS-REFORM
    combatLog: ['Welcome to Peaceful Lands! Select an area to begin your adventure...'],
    location: 'Village Outskirts',
    progress: 0,
    maxProgress: 100,
    abilities: [
      { key: 'power_slash', name: 'Power Slash' },
      null,
      null,
      null,
      null,
      null
    ]
  },
  // Combat Proficiency
  proficiency: {},

  equipment: { mainhand: { key: 'fist', type: 'weapon' }, head: null, torso: null, food: null }, // EQUIP-CHAR-UI
  inventory: [],
  sessionLoot: [], // EQUIP-CHAR-UI
  flags: { weaponsEnabled: true },
  cultivation: {
    talent: 1.0, // Base cultivation talent multiplier
    foundationMult: 1.0, // Foundation gain multiplier from various sources
    pillMult: 1.0, // Pill effectiveness multiplier
    buildingMult: 1.0 // Building effectiveness multiplier
  },
  // Cultivation Laws System
  laws: {
    selected: null, // Which law is currently selected
    unlocked: [], // Which laws are available for selection
    points: 0, // Law points earned through cultivation milestones
    trees: { // Progress in each law's skill tree
      sword: {},
      formation: {},
      alchemy: {}
    }
  },
  // Sect Buildings System
  buildings: {}, // Building levels: {building_key: level}
  // Building bonuses (calculated from building levels)
  buildingBonuses: {
    qiRegenMult: 0, qiCapMult: 0, herbYield: 0, oreYield: 0, woodYield: 0,
    alchemySlots: 0, alchemySuccess: 0, atkBase: 0, defBase: 0,
    disciples: 0, lawPoints: 0, breakthroughBonus: 0, foundationMult: 0
  }
  };
};

export let S = loadSave() || defaultState();

// Map resource properties to inventory entries so the inventory is the
// single source of truth for all items.  These properties are not
// serialized directly; instead their values are derived from the
// corresponding entries in `S.inventory`.
['stones', 'ore', 'herbs'].forEach(key => {
  const initial = S[key] || 0;
  Object.defineProperty(S, key, {
    get() {
      return S.inventory?.find(it => it.key === key)?.qty || 0;
    },
    set(val) {
      S.inventory = S.inventory || [];
      const item = S.inventory.find(it => it.key === key);
      if (val <= 0) {
        if (item) S.inventory.splice(S.inventory.indexOf(item), 1);
        return;
      }
      if (item) item.qty = val;
      else S.inventory.push({ id: key, key, type: 'material', qty: val });
    },
    enumerable: false,
    configurable: true
  });
  if (initial > 0) S[key] = initial; // populate inventory if save had values
});

export function save(){
  try{
    S.ver = SAVE_VERSION;
    localStorage.setItem('woa-save', JSON.stringify(S));
  }catch{ /* ignore */ }
}

export function setState(newState){
  S = newState;
}
