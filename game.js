
// Way of Ascension — Modular JS
const TABS = [
  {id:'cultivation', label:'Cultivation'},
  {id:'laws', label:'Laws'},
  {id:'gathering', label:'Gathering'},
  {id:'alchemy', label:'Alchemy', requiresUnlock: () => S.alchemy.unlocked},
  {id:'combat', label:'Combat'},
  {id:'sect', label:'Sect'}
];

const REALMS = [
  {name:'Mortal', stages:9, cap:100, fcap:60, baseRegen:1, atk:1, def:1, bt:0.60, power:1},
  {name:'Qi Refining', stages:9, cap:300, fcap:150, baseRegen:2, atk:3, def:2, bt:0.55, power:3},
  {name:'Foundation', stages:9, cap:800, fcap:400, baseRegen:3, atk:6, def:4, bt:0.50, power:8},
  {name:'Core', stages:9, cap:2000, fcap:1100, baseRegen:5, atk:12, def:8, bt:0.45, power:20},
  {name:'Nascent', stages:9, cap:7000, fcap:3000, baseRegen:8, atk:24, def:16, bt:0.40, power:50},
  {name:'Soul Formation', stages:9, cap:20000, fcap:8000, baseRegen:12, atk:40, def:28, bt:0.35, power:120},
  {name:'Void Refining', stages:9, cap:60000, fcap:25000, baseRegen:18, atk:70, def:50, bt:0.30, power:300},
  {name:'Body Integration', stages:9, cap:180000, fcap:80000, baseRegen:25, atk:120, def:85, bt:0.25, power:750},
  {name:'Mahayana', stages:9, cap:500000, fcap:250000, baseRegen:35, atk:200, def:140, bt:0.20, power:1800},
  {name:'Tribulation', stages:9, cap:1500000, fcap:800000, baseRegen:50, atk:350, def:250, bt:0.15, power:4500}
];

// Cultivation Laws - Unlocked at Foundation Stage
const LAWS = {
  sword: {
    name: 'Sword Law',
    desc: 'The path of the blade - focused on combat mastery and offensive techniques',
    icon: '⚔️',
    unlockReq: {realm: 2, stage: 1}, // Foundation 1
    bonuses: {atk: 1.2, critChance: 0.1, qiEfficiency: 0.9},
    tree: {
      'basic_sword': {name: 'Basic Sword Intent', desc: '+15% ATK, +5% crit chance', cost: 10, prereq: null, bonus: {atk: 0.15, critChance: 0.05}},
      'sharp_edge': {name: 'Sharp Edge', desc: '+20% ATK vs beasts', cost: 25, prereq: 'basic_sword', bonus: {beastDmg: 0.20}},
      'sword_qi': {name: 'Sword Qi Mastery', desc: '+30% Qi regen, techniques cost 10% less', cost: 40, prereq: 'basic_sword', bonus: {qiRegen: 0.30, qiCost: -0.10}},
      'cultivation_focus': {name: 'Cultivation Focus', desc: '+25% foundation gain, +10% cultivation talent', cost: 50, prereq: 'sword_qi', bonus: {foundationMult: 0.25, cultivationTalent: 0.10}},
      'piercing_strike': {name: 'Piercing Strike', desc: 'Unlocks Piercing Strike technique', cost: 60, prereq: 'sharp_edge', bonus: {technique: 'piercing_strike'}},
      'sword_heart': {name: 'Sword Heart', desc: '+50% ATK, +15% crit chance, +20% foundation gain', cost: 100, prereq: ['cultivation_focus', 'piercing_strike'], bonus: {atk: 0.50, critChance: 0.15, foundationMult: 0.20}},
      'thousand_cuts': {name: 'Thousand Cuts', desc: 'Unlocks Thousand Cuts ultimate technique', cost: 200, prereq: 'sword_heart', bonus: {technique: 'thousand_cuts'}}
    }
  },
  formation: {
    name: 'Formation Law',
    desc: 'The art of arrays and defensive techniques - focused on protection and resource efficiency',
    icon: '🛡️',
    unlockReq: {realm: 2, stage: 1}, // Foundation 1
    bonuses: {def: 1.3, qiRegen: 1.1, resourceYield: 1.05},
    tree: {
      'basic_formation': {name: 'Basic Formation Theory', desc: '+20% DEF, +10% resource yield', cost: 10, prereq: null, bonus: {def: 0.20, resourceYield: 0.10}},
      'qi_gathering': {name: 'Qi Gathering Array', desc: '+25% Qi regen, +15% Qi cap', cost: 25, prereq: 'basic_formation', bonus: {qiRegen: 0.25, qiCap: 0.15}},
      'protective_ward': {name: 'Protective Ward', desc: '+30% DEF, reduces damage by 5%', cost: 40, prereq: 'basic_formation', bonus: {def: 0.30, dmgReduction: 0.05}},
      'meditation_array': {name: 'Meditation Array', desc: '+30% foundation gain, +15% comprehension', cost: 50, prereq: 'qi_gathering', bonus: {foundationMult: 0.30, comprehension: 0.15}},
      'spirit_lock': {name: 'Spirit Lock Formation', desc: 'Unlocks Spirit Lock technique', cost: 60, prereq: 'protective_ward', bonus: {technique: 'spirit_lock'}},
      'grand_array': {name: 'Grand Defensive Array', desc: '+40% DEF, +20% all yields, +25% foundation gain', cost: 100, prereq: ['meditation_array', 'spirit_lock'], bonus: {def: 0.40, resourceYield: 0.20, foundationMult: 0.25}},
      'heaven_earth': {name: 'Heaven-Earth Formation', desc: 'Unlocks Heaven-Earth ultimate technique', cost: 200, prereq: 'grand_array', bonus: {technique: 'heaven_earth'}}
    }
  },
  alchemy: {
    name: 'Alchemy Law',
    desc: 'The way of pills and elixirs - focused on enhancement and support abilities',
    icon: '🧪',
    unlockReq: {realm: 2, stage: 1}, // Foundation 1
    bonuses: {alchemySuccess: 1.2, pillEffectiveness: 1.15, qiRegen: 1.05},
    tree: {
      'basic_alchemy': {name: 'Basic Pill Theory', desc: '+15% alchemy success, +10% pill effects', cost: 10, prereq: null, bonus: {alchemySuccess: 0.15, pillEffect: 0.10}},
      'herb_mastery': {name: 'Herb Mastery', desc: '+30% herb yield, +1 alchemy slot', cost: 25, prereq: 'basic_alchemy', bonus: {herbYield: 0.30, alchemySlots: 1}},
      'qi_condensation': {name: 'Qi Condensation', desc: '+20% Qi from pills, +15% Qi regen', cost: 40, prereq: 'basic_alchemy', bonus: {pillQiBonus: 0.20, qiRegen: 0.15}},
      'pill_mastery': {name: 'Pill Mastery', desc: '+40% pill effectiveness, +20% foundation from pills', cost: 50, prereq: 'qi_condensation', bonus: {pillMult: 0.40, pillFoundation: 0.20}},
      'transmutation': {name: 'Transmutation Art', desc: 'Unlocks Transmutation technique', cost: 60, prereq: 'herb_mastery', bonus: {technique: 'transmutation'}},
      'master_alchemist': {name: 'Master Alchemist', desc: '+25% success, +20% pill effects, +1 slot, +15% comprehension', cost: 100, prereq: ['pill_mastery', 'transmutation'], bonus: {alchemySuccess: 0.25, pillEffect: 0.20, alchemySlots: 1, comprehension: 0.15}},
      'immortal_elixir': {name: 'Immortal Elixir', desc: 'Unlocks Immortal Elixir ultimate technique', cost: 200, prereq: 'master_alchemist', bonus: {technique: 'immortal_elixir'}}
    }
  }
};

const BEASTS = [
  {name:'Wild Rabbit', hp:20, atk:2, def:0, reward:{stones:5, herbs:2}},
  {name:'Boar', hp:60, atk:5, def:2, reward:{stones:15, ore:3}},
  {name:'Spirit Wolf', hp:140, atk:10, def:4, reward:{stones:35, wood:6}},
  {name:'Tiger', hp:300, atk:18, def:8, reward:{stones:80, ore:12}},
  {name:'Dragon Whelp', hp:800, atk:40, def:18, reward:{stones:220, herbs:30, ore:25}}
];

// Sect Buildings System - Progressive unlocks with scaling costs
const SECT_BUILDINGS = {
  // Basic Infrastructure (Unlocked from start)
  meditation_mat: {
    name: 'Meditation Mat',
    desc: 'A simple mat for focused cultivation',
    icon: '🧘',
    category: 'cultivation',
    unlockReq: {realm: 0, stage: 1}, // Mortal 1
    maxLevel: 5,
    baseCost: {stones: 20},
    costScaling: 1.8,
    effects: {
      1: {qiRegenMult: 0.15, foundationMult: 0.20, desc: '+15% Qi regen, +20% foundation gain'},
      2: {qiRegenMult: 0.30, foundationMult: 0.40, desc: '+30% Qi regen, +40% foundation gain'},
      3: {qiRegenMult: 0.50, foundationMult: 0.65, desc: '+50% Qi regen, +65% foundation gain'},
      4: {qiRegenMult: 0.75, foundationMult: 0.95, desc: '+75% Qi regen, +95% foundation gain'},
      5: {qiRegenMult: 1.00, foundationMult: 1.30, desc: '+100% Qi regen, +130% foundation gain'}
    }
  },
  
  spirit_well: {
    name: 'Spirit Well',
    desc: 'A well that gathers spiritual energy',
    icon: '🏺',
    category: 'cultivation',
    unlockReq: {realm: 1, stage: 3}, // Qi Refining 3
    maxLevel: 4,
    baseCost: {stones: 50, wood: 20},
    costScaling: 2.0,
    effects: {
      1: {qiCapMult: 0.25, desc: '+25% Qi capacity'},
      2: {qiCapMult: 0.50, desc: '+50% Qi capacity'},
      3: {qiCapMult: 0.80, desc: '+80% Qi capacity'},
      4: {qiCapMult: 1.20, desc: '+120% Qi capacity'}
    }
  },
  
  // Resource Buildings
  herbal_garden: {
    name: 'Herbal Garden',
    desc: 'Cultivated plots for growing spiritual herbs',
    icon: '🌿',
    category: 'resources',
    unlockReq: {realm: 1, stage: 5}, // Qi Refining 5
    maxLevel: 6,
    baseCost: {stones: 40, wood: 25},
    costScaling: 1.9,
    effects: {
      1: {herbYield: 0.30, desc: '+30% herb yield'},
      2: {herbYield: 0.60, desc: '+60% herb yield'},
      3: {herbYield: 1.00, desc: '+100% herb yield'},
      4: {herbYield: 1.50, desc: '+150% herb yield'},
      5: {herbYield: 2.10, desc: '+210% herb yield'},
      6: {herbYield: 3.00, desc: '+300% herb yield'}
    }
  },
  
  spirit_mine: {
    name: 'Spirit Mine',
    desc: 'Deep shafts that extract spiritual ores',
    icon: '⛏️',
    category: 'resources',
    unlockReq: {realm: 2, stage: 1}, // Foundation 1
    maxLevel: 5,
    baseCost: {stones: 80, ore: 15},
    costScaling: 2.1,
    effects: {
      1: {oreYield: 0.40, desc: '+40% ore yield'},
      2: {oreYield: 0.85, desc: '+85% ore yield'},
      3: {oreYield: 1.40, desc: '+140% ore yield'},
      4: {oreYield: 2.10, desc: '+210% ore yield'},
      5: {oreYield: 3.00, desc: '+300% ore yield'}
    }
  },
  
  sacred_grove: {
    name: 'Sacred Grove',
    desc: 'Ancient trees imbued with spiritual energy',
    icon: '🌳',
    category: 'resources',
    unlockReq: {realm: 2, stage: 3}, // Foundation 3
    maxLevel: 5,
    baseCost: {stones: 100, wood: 50, herbs: 20},
    costScaling: 2.0,
    effects: {
      1: {woodYield: 0.50, desc: '+50% wood yield'},
      2: {woodYield: 1.00, desc: '+100% wood yield'},
      3: {woodYield: 1.70, desc: '+170% wood yield'},
      4: {woodYield: 2.50, desc: '+250% wood yield'},
      5: {woodYield: 3.50, desc: '+350% wood yield'}
    }
  },
  
  // Advanced Buildings
  alchemy_lab: {
    name: 'Alchemy Laboratory',
    desc: 'Advanced facility for pill refinement - unlocks alchemy',
    icon: '🏛️',
    category: 'alchemy',
    unlockReq: {realm: 1, stage: 5}, // Qi Refining 5 - earlier unlock
    maxLevel: 4,
    baseCost: {stones: 100, ore: 40, wood: 60, herbs: 30}, // Reduced cost
    costScaling: 2.0, // Reduced scaling
    effects: {
      1: {alchemyUnlock: true, alchemySlots: 1, alchemySuccess: 0.15, desc: 'Unlocks alchemy, +1 slot, +15% success'},
      2: {alchemySlots: 1, alchemySuccess: 0.30, desc: '+1 slot, +30% success'},
      3: {alchemySlots: 2, alchemySuccess: 0.50, desc: '+2 slots, +50% success'},
      4: {alchemySlots: 2, alchemySuccess: 0.75, desc: '+2 slots, +75% success'}
    }
  },
  
  training_grounds: {
    name: 'Training Grounds',
    desc: 'Facilities for combat training and sparring',
    icon: '⚔️',
    category: 'combat',
    unlockReq: {realm: 2, stage: 7}, // Foundation 7
    maxLevel: 5,
    baseCost: {stones: 200, ore: 80, wood: 60},
    costScaling: 2.2,
    effects: {
      1: {atkBase: 3, defBase: 2, desc: '+3 ATK, +2 DEF'},
      2: {atkBase: 6, defBase: 4, desc: '+6 ATK, +4 DEF'},
      3: {atkBase: 10, defBase: 7, desc: '+10 ATK, +7 DEF'},
      4: {atkBase: 15, defBase: 11, desc: '+15 ATK, +11 DEF'},
      5: {atkBase: 22, defBase: 16, desc: '+22 ATK, +16 DEF'}
    }
  },
  
  disciple_quarters: {
    name: 'Disciple Quarters',
    desc: 'Housing for sect disciples',
    icon: '🏠',
    category: 'disciples',
    unlockReq: {realm: 3, stage: 1}, // Core 1
    maxLevel: 6,
    baseCost: {stones: 120, wood: 100},
    costScaling: 1.7,
    effects: {
      1: {disciples: 1, desc: '+1 disciple'},
      2: {disciples: 2, desc: '+2 disciples'},
      3: {disciples: 3, desc: '+3 disciples'},
      4: {disciples: 4, desc: '+4 disciples'},
      5: {disciples: 6, desc: '+6 disciples'},
      6: {disciples: 8, desc: '+8 disciples'}
    }
  },
  
  // Elite Buildings (High-tier unlocks)
  grand_library: {
    name: 'Grand Library',
    desc: 'Repository of ancient cultivation knowledge',
    icon: '📚',
    category: 'knowledge',
    unlockReq: {realm: 3, stage: 5}, // Core 5
    maxLevel: 3,
    baseCost: {stones: 500, wood: 300, herbs: 100, cores: 10},
    costScaling: 2.5,
    effects: {
      1: {lawPoints: 5, qiRegenMult: 0.25, desc: '+5 law points, +25% Qi regen'},
      2: {lawPoints: 10, qiRegenMult: 0.50, desc: '+10 law points, +50% Qi regen'},
      3: {lawPoints: 20, qiRegenMult: 1.00, desc: '+20 law points, +100% Qi regen'}
    }
  },
  
  celestial_observatory: {
    name: 'Celestial Observatory',
    desc: 'Tower for studying heavenly phenomena',
    icon: '🔭',
    category: 'advanced',
    unlockReq: {realm: 4, stage: 1}, // Nascent 1
    maxLevel: 2,
    baseCost: {stones: 800, ore: 400, wood: 300, herbs: 200, cores: 25},
    costScaling: 3.0,
    effects: {
      1: {breakthroughBonus: 0.20, lawPoints: 10, desc: '+20% breakthrough chance, +10 law points'},
      2: {breakthroughBonus: 0.40, lawPoints: 25, desc: '+40% breakthrough chance, +25 law points'}
    }
  }
};

// Legacy sect actions - will be replaced by building system
const LEGACY_SECT_ACTIONS = [
  {name:'Meditation Pavilion', cost:{wood:150, stones:200}, act:s=>{s.qiRegenMult+=0.35; log('Built Meditation Pavilion: +35% Qi regen','good');}},
  {name:'Refining Hall', cost:{ore:180, stones:250}, act:s=>{s.atkBase+=6; s.defBase+=4; log('Built Refining Hall: +ATK/DEF','good');}},
  {name:'Herbalists Guild', cost:{herbs:220, stones:220}, act:s=>{s.yieldMult.herbs+=0.5; log('Herbalists Guild formed: big herb yield','good');}},
  {name:'Library of Dao', cost:{stones:400}, act:s=>{s.auto.meditate=true; document.getElementById('autoMeditate').checked=true; log('Library teaches auto-meditation','good');}}
];

const KARMA_UPS = [
  {key:'k_qi', name:'Inner Stillness', desc:'+15% Qi regen (permanent)', base:5, mult:1.45, eff:s=>s.karma.qiRegen+=0.15},
  {key:'k_yield', name:'Providence', desc:'+12% resource yield (perm.)', base:5, mult:1.6, eff:s=>s.karma.yield+=0.12},
  {key:'k_blade', name:'Sword Intent', desc:'+10% ATK (perm.)', base:8, mult:1.7, eff:s=>s.karma.atk+=0.10},
  {key:'k_shell', name:'Stone Body', desc:'+10% DEF (perm.)', base:8, mult:1.7, eff:s=>s.karma.def+=0.10}
];

const fmt = n=>{
  if (n>=1e12) return (n/1e12).toFixed(2)+'t';
  if (n>=1e9) return (n/1e9).toFixed(2)+'b';
  if (n>=1e6) return (n/1e6).toFixed(2)+'m';
  if (n>=1e3) return (n/1e3).toFixed(2)+'k';
  return Math.floor(n).toString();
}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const qs = sel => document.querySelector(sel);

const defaultState=()=>({
  time:0,
  qi:0, qiCap:100, qiRegen:1, qiRegenMult:0, qiCapMult:0, foundation:0,
  realm:{tier:0, stage:1},
  stones:0, herbs:0, ore:0, wood:0, cores:0,
  pills:{qi:0, body:0, ward:0},
  hp:100, hpMax:100, atkBase:5, defBase:2, tempAtk:0, tempDef:0,
  disciples:1,
  gather:{herbs:0, ore:0, wood:0},
  yieldMult:{herbs:0, ore:0, wood:0},
  alchemy:{level:1, xp:0, queue:[], maxSlots:1, successBonus:0, unlocked:false, knownRecipes:['qi']}, // Start with only Qi recipe
  combat:{hunt:null, cds:{slash:0,guard:0,burst:0}, guardUntil:0, techniques:{}},
  bought:{},
  karmaPts:0, ascensions:0,
  karma:{qiRegen:0, yield:0, atk:0, def:0},
  auto:{meditate:true, brewQi:false, hunt:false}, // Auto-meditate enabled by default
  // Enhanced Cultivation System
  cultivation: {
    talent: 1.0, // Base cultivation talent multiplier
    comprehension: 1.0, // Comprehension multiplier for foundation gain
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
  buildings: {} // Building levels: {building_key: level}
});

let S = load() || defaultState();

// Migrate old saves to include laws system
if(!S.laws) {
  S.laws = {
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

// Migrate old saves to include buildings system
if(!S.buildings) {
  S.buildings = {};
}

// Migrate old saves to include cultivation system
if(!S.cultivation) {
  S.cultivation = {
    talent: 1.0,
    comprehension: 1.0,
    foundationMult: 1.0,
    pillMult: 1.0,
    buildingMult: 1.0
  };
}

// Migrate old saves to include alchemy progression system
if(!S.alchemy.hasOwnProperty('unlocked')) {
  S.alchemy.unlocked = true; // Old saves had alchemy unlocked by default
  S.alchemy.knownRecipes = ['qi', 'body', 'ward']; // Old saves knew all recipes
}

function updateQiOrbEffect(){
  const qiOrb = document.getElementById('qiOrb');
  if(!qiOrb) return;
  
  // Check if foundation is at maximum capacity
  const isFoundationMax = S.foundation >= fCap() * 0.99; // 99% or higher counts as "max"
  
  if(isFoundationMax) {
    qiOrb.classList.add('foundation-max');
  } else {
    qiOrb.classList.remove('foundation-max');
  }
}

function updateTabVisibility(){
  const nav = document.getElementById('tabs');
  const tabs = nav.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    const tabId = tab.dataset.tab;
    const tabConfig = TABS.find(t => t.id === tabId);
    
    if(tabConfig && tabConfig.requiresUnlock) {
      const shouldShow = tabConfig.requiresUnlock();
      tab.style.display = shouldShow ? 'block' : 'none';
      
      // If current active tab becomes hidden, switch to cultivation tab
      if(!shouldShow && tab.classList.contains('active')) {
        tab.classList.remove('active');
        document.getElementById('tab-' + tabId).classList.remove('active');
        
        // Switch to cultivation tab
        const cultivationTab = nav.querySelector('[data-tab="cultivation"]');
        const cultivationSection = document.getElementById('tab-cultivation');
        if(cultivationTab && cultivationSection) {
          cultivationTab.classList.add('active');
          cultivationSection.classList.add('active');
        }
      }
    }
  });
}

function initUI(){
  // Tabs
  const nav = document.getElementById('tabs');
  TABS.forEach((t,i)=>{
    const b=document.createElement('button'); b.className='tab'+(i===0?' active':''); b.textContent=t.label; b.dataset.tab=t.id; nav.appendChild(b);
  });
  nav.addEventListener('click',e=>{
    if(!e.target.classList.contains('tab')) return;
    [...nav.children].forEach(x=>x.classList.remove('active')); e.target.classList.add('active');
    document.querySelectorAll('.content > section').forEach(s=>s.classList.remove('active'));
    document.getElementById('tab-'+e.target.dataset.tab).classList.add('active');
  });

  // Fill beasts
  const bs = document.getElementById('beastSelect');
  BEASTS.forEach((b,i)=>{const o=document.createElement('option'); o.value=i; o.textContent=`${b.name} (HP ${b.hp})`; bs.appendChild(o)});

  // Assign buttons
  document.getElementById('tab-gathering').addEventListener('click', e=>{
    const d = e.target.dataset.assign; if(!d) return; const [res,op]=d.split(':'); const delta=+op; assign(res, delta);
  });

  // Buttons
  qs('#meditateBtn').addEventListener('click', meditate);
  qs('#breakthroughBtn').addEventListener('click', tryBreakthrough);
  qs('#brewBtn').addEventListener('click', addBrew);
  qs('#huntBtn').addEventListener('click', startHunt);
  qs('#useQiPill').addEventListener('click', ()=>usePill('qi'));
  qs('#useBodyPill').addEventListener('click', ()=>usePill('body'));
  qs('#useWardPill').addEventListener('click', ()=>usePill('ward'));

  // Autos
  qs('#autoMeditate').checked=S.auto.meditate; qs('#autoMeditate').addEventListener('change',e=>S.auto.meditate=e.target.checked);
  qs('#autoBrewQi').checked=S.auto.brewQi; qs('#autoBrewQi').addEventListener('change',e=>S.auto.brewQi=e.target.checked);
  qs('#autoHunt').checked=S.auto.hunt; qs('#autoHunt').addEventListener('change',e=>S.auto.hunt=e.target.checked);

  // Save/Load
  qs('#saveBtn').addEventListener('click', save);
  qs('#resetBtn').addEventListener('click', ()=>{ if(confirm('Hard reset?')){ S=defaultState(); save(); location.reload(); }});
  qs('#exportBtn').addEventListener('click', ()=>{
    const blob=new Blob([JSON.stringify(S)],{type:'application/json'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='way-of-ascension-save.json'; a.click(); URL.revokeObjectURL(url);
  });
  qs('#importBtn').addEventListener('click', async()=>{
    const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json';
    inp.onchange=()=>{ const f=inp.files[0]; const r=new FileReader(); r.onload=()=>{ try{ S=JSON.parse(r.result); save(); location.reload(); }catch{ alert('Invalid file'); } }; r.readAsText(f); };
    inp.click();
  });

  renderUpgrades(); renderSect(); renderKarma();
  updateAll();
}

function updateAll(){
  // Realm display
  const r = REALMS[S.realm.tier];
  setText('realmName', `${r.name} ${S.realm.stage}`);
  
  // Qi
  setText('qiVal', fmt(S.qi)); setText('qiCap', fmt(qCap()));
  setText('qiValL', fmt(S.qi)); setText('qiCapL', fmt(qCap()));
  setText('qiRegen', qiRegenPerSec().toFixed(1));
  setFill('qiFill', S.qi / qCap());
  setFill('qiFill2', S.qi / qCap());
  setText('qiPct', Math.floor(100 * S.qi / qCap()) + '%');
  
  // Foundation
  setText('foundValL', fmt(S.foundation)); setText('foundCapL', fmt(fCap()));
  setFill('foundFill', S.foundation / fCap());
  setFill('foundFill2', S.foundation / fCap());
  setText('foundPct', Math.floor(100 * S.foundation / fCap()) + '%');
  
  // HP
  setText('hpVal', fmt(S.hp)); setText('hpMax', fmt(S.hpMax));
  setText('hpValL', fmt(S.hp)); setText('hpMaxL', fmt(S.hpMax));
  setFill('hpFill', S.hp / S.hpMax);
  
  // Stats
  setText('atkVal', fmt(calcAtk())); setText('defVal', fmt(calcDef()));
  
  // Resources
  setText('stonesVal', fmt(S.stones)); setText('stonesValL', fmt(S.stones));
  setText('herbVal', fmt(S.herbs)); setText('oreVal', fmt(S.ore)); setText('woodVal', fmt(S.wood)); setText('coreVal', fmt(S.cores));
  setText('pillQi', S.pills.qi); setText('pillBody', S.pills.body); setText('pillWard', S.pills.ward);
  
  // Disciples
  setText('discTotal', S.disciples); setText('discFree', freeDisciples());
  setText('assHerb', S.gather.herbs); setText('assOre', S.gather.ore); setText('assWood', S.gather.wood);
  setText('yieldHerb', yieldBase('herbs').toFixed(1)); setText('yieldOre', yieldBase('ore').toFixed(1)); setText('yieldWood', yieldBase('wood').toFixed(1));
  
  // Alchemy
  setText('alchLvl', S.alchemy.level); setText('alchXp', S.alchemy.xp); setText('slotCount', S.alchemy.maxSlots);
  
  // Breakthrough
  const btChance = breakthroughChance();
  setText('btChance', Math.floor(btChance * 100));
  
  // Show breakthrough requirements and difficulty factors
  if (btChance > 0) {
    const realm = REALMS[S.realm.tier];
    const stageMultiplier = 1 - (S.realm.stage - 1) * 0.05;
    const realmPenalty = S.realm.tier * 0.02;
    const html = document.getElementById('breakthroughDetails');
    html.innerHTML = `
      <small>Base: ${(realm.bt * 100).toFixed(1)}% | Stage penalty: ${((1-stageMultiplier) * 100).toFixed(1)}% | Realm penalty: ${(realmPenalty * 100).toFixed(1)}%</small>
    `;
  }
  
  // Karma
  setText('karmaVal', S.karmaPts);
  document.getElementById('ascendBtn').disabled = calcKarmaGain() <= 0;
  
  // Laws
  updateLawsDisplay();
  
  renderKarma(); renderQueue(); renderAlchemyUI(); renderBuildings();
  updateTabVisibility();
  updateQiOrbEffect();
}

function setText(id, v){const el=document.getElementById(id); if(el) el.textContent=v}
function setFill(id, ratio){ratio=clamp(ratio,0,1); const el=document.getElementById(id); if(el) el.style.width=(ratio*100).toFixed(1)+'%'}

function renderUpgrades(){
  // Legacy function - now handled by renderBuildings in sect tab
  // Keep empty to avoid breaking existing calls
}

function renderSect(){
  // Legacy function - now handled by renderBuildings
  renderBuildings();
}

function renderBuildings(){
  const container = document.getElementById('buildingsContainer');
  if(!container) return;
  
  container.innerHTML = '';
  
  // Group buildings by category
  const categories = {
    cultivation: {name: 'Cultivation', buildings: []},
    resources: {name: 'Resource Production', buildings: []},
    alchemy: {name: 'Alchemy', buildings: []},
    combat: {name: 'Combat Training', buildings: []},
    disciples: {name: 'Disciple Management', buildings: []},
    knowledge: {name: 'Knowledge & Research', buildings: []},
    advanced: {name: 'Advanced Structures', buildings: []}
  };
  
  // Sort buildings into categories
  for(const [buildingKey, building] of Object.entries(SECT_BUILDINGS)){
    if(categories[building.category]){
      categories[building.category].buildings.push({key: buildingKey, ...building});
    }
  }
  
  // Render each category
  for(const [categoryKey, category] of Object.entries(categories)){
    if(category.buildings.length === 0) continue;
    
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'building-category';
    
    const categoryTitle = document.createElement('h4');
    categoryTitle.textContent = category.name;
    categoryDiv.appendChild(categoryTitle);
    
    const buildingsGrid = document.createElement('div');
    buildingsGrid.className = 'buildings-grid';
    
    category.buildings.forEach(building => {
      const buildingDiv = document.createElement('div');
      const isUnlocked = isBuildingUnlocked(building.key);
      const currentLevel = getBuildingLevel(building.key);
      const canAfford = canAffordBuilding(building.key);
      const isMaxLevel = currentLevel >= building.maxLevel;
      
      buildingDiv.className = `building-card ${isUnlocked ? 'unlocked' : 'locked'} ${canAfford && !isMaxLevel ? 'affordable' : ''}`;
      
      let content = `
        <div class="building-header">
          <span class="building-icon">${building.icon}</span>
          <div class="building-info">
            <div class="building-name">${building.name}</div>
            <div class="building-level">Level ${currentLevel}/${building.maxLevel}</div>
          </div>
        </div>
        <div class="building-desc">${building.desc}</div>
      `;
      
      if(!isUnlocked){
        const req = building.unlockReq;
        const realmName = REALMS[req.realm].name;
        content += `<div class="unlock-req">Unlocks at ${realmName} ${req.stage}</div>`;
      } else if(isMaxLevel){
        const effect = building.effects[currentLevel];
        content += `
          <div class="current-effect">${effect.desc}</div>
          <div class="max-level">MAX LEVEL</div>
        `;
      } else {
        const cost = getBuildingCost(building.key);
        const nextEffect = building.effects[currentLevel + 1];
        const costStr = Object.entries(cost).map(([k,v])=>`${fmt(v)} ${icon(k)}`).join(' ');
        
        content += `
          <div class="next-effect">${nextEffect.desc}</div>
          <div class="building-cost">${costStr}</div>
          <button class="btn ${canAfford ? 'primary' : 'disabled'}" onclick="upgradeBuilding('${building.key}')" ${!canAfford ? 'disabled' : ''}>
            ${currentLevel === 0 ? 'Build' : 'Upgrade'}
          </button>
        `;
      }
      
      buildingDiv.innerHTML = content;
      buildingsGrid.appendChild(buildingDiv);
    });
    
    categoryDiv.appendChild(buildingsGrid);
    container.appendChild(categoryDiv);
  }
}

function icon(resource) {
  const icons = {
    stones: '🪨',
    herbs: '🌿', 
    ore: '⛏️',
    wood: '🪵',
    cores: '💎'
  };
  return icons[resource] || '❓';
}

function renderKarma(){
  const body=document.getElementById('karmaUpgrades'); body.innerHTML='';
  KARMA_UPS.forEach(k=>{
    const cost = k.base * Math.pow(k.mult, S.karma[k.key.slice(2)] || 0);
    const div=document.createElement('div');
    div.innerHTML=`<button class="btn small" data-karma="${k.key}">${k.name}</button><div class="muted">${k.desc}</div><div class="muted">Cost: ${Math.floor(cost)} karma</div>`;
    body.appendChild(div);
  });
  body.onclick=e=>{const key=e.target?.dataset?.karma; if(!key) return; const k=KARMA_UPS.find(x=>x.key===key); const cost=k.base*Math.pow(k.mult,S.karma[k.key.slice(2)]||0); if(S.karmaPts>=cost){ S.karmaPts-=cost; k.eff(S); updateAll(); }};
}

function renderAlchemyUI(){
  // Update recipe select based on known recipes and unlock status
  const recipeSelect = document.getElementById('recipeSelect');
  const brewBtn = document.getElementById('brewBtn');
  
  if(!S.alchemy.unlocked) {
    recipeSelect.innerHTML = '<option value="">Alchemy not unlocked - Build Alchemy Laboratory</option>';
    recipeSelect.disabled = true;
    brewBtn.disabled = true;
    brewBtn.textContent = '🔒 Locked';
    return;
  }
  
  recipeSelect.disabled = false;
  brewBtn.disabled = false;
  brewBtn.textContent = '🔥 Brew';
  
  recipeSelect.innerHTML = '';
  S.alchemy.knownRecipes.forEach(key => {
    const recipe = RECIPES[key];
    if(recipe) {
      const option = document.createElement('option');
      option.value = key;
      const costStr = Object.entries(recipe.cost).map(([res, amt]) => {
        const icons = {herbs: '🌿', ore: '⛏️', wood: '🪵', stones: '🪨'};
        return `${amt}${icons[res] || res}`;
      }).join(' ');
      option.textContent = `${recipe.name} (${costStr}, ${recipe.time}s, ${Math.floor(recipe.base*100)}%)`;
      recipeSelect.appendChild(option);
    }
  });
  
  // Add unknown recipes as disabled options with hints
  Object.entries(RECIPES).forEach(([key, recipe]) => {
    if(!S.alchemy.knownRecipes.includes(key)) {
      const option = document.createElement('option');
      option.value = '';
      option.disabled = true;
      option.textContent = `??? - ${recipe.unlockHint}`;
      recipeSelect.appendChild(option);
    }
  });
}

function renderQueue(){
  const tbody = document.getElementById('queueTable');
  if(!tbody) return;
  tbody.innerHTML = '';
  S.alchemy.queue.forEach((q, i) => {
    const tr = document.createElement('tr');
    const prog = q.done ? 'Done' : `${q.T - q.t}s`;
    const btn = q.done ? `<button class="btn small" onclick="collectBrew(${i})">Collect</button>` : '';
    tr.innerHTML = `<td>${q.name}</td><td>${prog}</td><td>${q.done ? 'Ready' : 'Brewing'}</td><td>${btn}</td>`;
    tbody.appendChild(tr);
  });
}

function updateLawsDisplay(){
  // Update law points display
  if(document.getElementById('lawPoints')){
    setText('lawPoints', S.laws.points);
  }
  
  // Update selected law display
  if(document.getElementById('selectedLaw')){
    const selectedText = S.laws.selected ? LAWS[S.laws.selected].name : 'None';
    setText('selectedLaw', selectedText);
  }
  
  // Update law selection buttons
  renderLawSelection();
  
  // Update skill trees
  renderSkillTrees();
}

function renderLawSelection(){
  const container = document.getElementById('lawSelection');
  if(!container) return;
  
  container.innerHTML = '';
  
  if(S.laws.unlocked.length === 0){
    container.innerHTML = '<p class="muted">Laws unlock at Foundation stage.</p>';
    return;
  }
  
  S.laws.unlocked.forEach(lawKey => {
    const law = LAWS[lawKey];
    const isSelected = S.laws.selected === lawKey;
    const div = document.createElement('div');
    div.className = 'card law-card';
    if(isSelected) div.classList.add('selected');
    
    div.innerHTML = `
      <h4>${law.icon} ${law.name} ${isSelected ? '(Selected)' : ''}</h4>
      <p class="muted">${law.desc}</p>
      <div class="law-bonuses">
        ${Object.entries(law.bonuses).map(([key, value]) => {
          let bonus = '';
          if(key === 'atk') bonus = `+${Math.round((value-1)*100)}% ATK`;
          else if(key === 'def') bonus = `+${Math.round((value-1)*100)}% DEF`;
          else if(key === 'qiRegen') bonus = `+${Math.round((value-1)*100)}% Qi Regen`;
          else if(key === 'resourceYield') bonus = `+${Math.round((value-1)*100)}% Resources`;
          else if(key === 'alchemySuccess') bonus = `+${Math.round((value-1)*100)}% Alchemy`;
          else if(key === 'pillEffectiveness') bonus = `+${Math.round((value-1)*100)}% Pills`;
          else if(key === 'critChance') bonus = `+${Math.round(value*100)}% Crit`;
          return bonus ? `<span class="bonus">${bonus}</span>` : '';
        }).join('')}
      </div>
      ${!isSelected ? `<button class="btn primary" onclick="selectLaw('${lawKey}')">Select Law</button>` : ''}
    `;
    
    container.appendChild(div);
  });
}

function renderSkillTrees(){
  const container = document.getElementById('skillTrees');
  if(!container || !S.laws.selected) return;
  
  const law = LAWS[S.laws.selected];
  const tree = S.laws.trees[S.laws.selected];
  
  container.innerHTML = `<h4>${law.icon} ${law.name} Skill Tree</h4>`;
  
  const skillsDiv = document.createElement('div');
  skillsDiv.className = 'skills-grid';
  
  Object.entries(law.tree).forEach(([skillKey, skill]) => {
    const isLearned = tree[skillKey];
    const canLearn = canLearnSkill(S.laws.selected, skillKey);
    
    const skillDiv = document.createElement('div');
    skillDiv.className = `skill-node ${isLearned ? 'learned' : ''} ${canLearn ? 'available' : ''}`;
    
    skillDiv.innerHTML = `
      <div class="skill-name">${skill.name}</div>
      <div class="skill-desc">${skill.desc}</div>
      <div class="skill-cost">Cost: ${skill.cost} points</div>
      ${!isLearned && canLearn ? `<button class="btn small" onclick="learnSkill('${S.laws.selected}', '${skillKey}')">Learn</button>` : ''}
      ${isLearned ? '<div class="learned-badge">✓</div>' : ''}
    `;
    
    skillsDiv.appendChild(skillDiv);
  });
  
  container.appendChild(skillsDiv);
}

/* Mechanics */
function qCap(){
  const lawBonuses = getLawBonuses();
  return REALMS[S.realm.tier].cap * (1 + S.qiCapMult) * lawBonuses.qiCap;
}
function qiRegenPerSec(){
  const lawBonuses = getLawBonuses();
  return (REALMS[S.realm.tier].baseRegen + S.karma.qiRegen*10) * (1 + S.qiRegenMult) * lawBonuses.qiRegen;
}
function fCap(){ return REALMS[S.realm.tier].fcap; }
function foundationGainPerSec(){
  // Base foundation gain from meditation
  const baseGain = qiRegenPerSec() * 0.8;
  
  // Ensure cultivation object exists
  if (!S.cultivation) {
    S.cultivation = {
      talent: 1.0,
      comprehension: 1.0,
      foundationMult: 1.0,
      pillMult: 1.0,
      buildingMult: 1.0
    };
  }
  
  // Apply cultivation multipliers
  const cultivationMult = S.cultivation.talent * S.cultivation.comprehension * S.cultivation.foundationMult;
  
  // Apply law bonuses
  const lawBonuses = getLawBonuses();
  const lawMult = lawBonuses.foundationMult || 1;
  
  // Apply building multipliers
  const buildingMult = S.cultivation.buildingMult;
  
  // Apply pill multipliers (temporary boost from consumed pills)
  const pillMult = S.cultivation.pillMult;
  
  // Calculate total gain
  const totalGain = baseGain * cultivationMult * lawMult * buildingMult * pillMult;
  
  return totalGain;
}

function foundationGainPerMeditate(){ return foundationGainPerSec() * 2.5; }
function calcAtk(){
  const lawBonuses = getLawBonuses();
  return (S.atkBase + S.tempAtk + REALMS[S.realm.tier].atk + S.karma.atk*100) * lawBonuses.atk;
}
function calcDef(){
  const lawBonuses = getLawBonuses();
  return (S.defBase + S.tempDef + REALMS[S.realm.tier].def + S.karma.def*100) * lawBonuses.def;
}

// Initialize law system on game start
function initLawSystem(){
  // Ensure laws object exists
  if(!S.laws) {
    S.laws = {
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
  
  // Ensure buildings object exists
  if(!S.buildings) {
    S.buildings = {};
  }
  
  // Ensure building bonuses exist
  if(!S.buildingBonuses) {
    S.buildingBonuses = {
      qiRegenMult: 0, qiCapMult: 0, herbYield: 0, oreYield: 0, woodYield: 0,
      alchemySlots: 0, alchemySuccess: 0, atkBase: 0, defBase: 0,
      disciples: 0, lawPoints: 0, breakthroughBonus: 0
    };
  }
  
  // Check for any laws that should already be unlocked
  checkLawUnlocks();
  
  // Apply building effects
  applyBuildingEffects();
}

function meditate(){
  const gain = foundationGainPerMeditate();
  S.foundation = clamp(S.foundation + gain, 0, fCap());
  log(`Meditated: +${gain.toFixed(1)} Foundation`);
  updateAll();
}

function breakthroughChance(){
  if(S.qi < qCap()*0.99 || S.foundation < fCap()*0.99) return 0;
  
  // Base chance decreases with each realm and stage
  const realm = REALMS[S.realm.tier];
  let base = realm.bt;
  
  // Progressive difficulty scaling
  const stageMultiplier = 1 - (S.realm.stage - 1) * 0.05; // Each stage reduces chance by 5%
  const realmPenalty = S.realm.tier * 0.02; // Each realm adds 2% penalty
  
  base = base * stageMultiplier - realmPenalty;
  
  // Bonuses
  const ward = S.pills.ward>0 ? 0.15 : 0;
  const alchemyBonus = S.alchemy.successBonus * 0.1; // Reduced from 0.2
  const buildingBonus = S.buildingBonuses.breakthroughBonus || 0;
  const cultivationBonus = (S.cultivation.talent - 1) * 0.1; // Talent helps with breakthroughs
  
  const totalChance = base + ward + alchemyBonus + buildingBonus + cultivationBonus;
  
  return clamp(totalChance, 0.01, 0.95); // Minimum 1%, maximum 95%
}

function tryBreakthrough(){
  const haveQi = S.qi >= qCap()*0.99; const haveFound = S.foundation >= fCap()*0.99;
  if(!haveQi || !haveFound){
    log(`Requirements: Qi ${Math.floor(100*S.qi/qCap())}% & Foundation ${Math.floor(100*S.foundation/fCap())}%`, 'bad');
    return;
  }
  const ch = breakthroughChance();
  if(S.pills.ward>0){ S.pills.ward--; }
  if(Math.random()<ch){
    S.qi=0; S.foundation=0; advanceRealm(); log('Breakthrough succeeded! Realm advanced.','good');
  }else{
    S.qi=0; S.foundation = Math.max(0, S.foundation - Math.ceil(fCap()*0.25)); S.hp = Math.max(1, S.hp - Math.ceil(S.hpMax*0.2)); log('Tribulation backlash! Breakthrough failed.','bad');
  }
  updateAll();
}

function advanceRealm(){
  S.realm.stage++;
  if(S.realm.stage > REALMS[S.realm.tier].stages){ S.realm.tier++; S.realm.stage = 1; }
  log(`Advanced to ${REALMS[S.realm.tier].name} ${S.realm.stage}!`, 'good');
  
  // Check for law unlocks and award law points
  checkLawUnlocks();
  awardLawPoints();
}

// Law System Functions
function checkLawUnlocks(){
  for(const lawKey in LAWS){
    const law = LAWS[lawKey];
    if(!S.laws.unlocked.includes(lawKey)){
      if(S.realm.tier >= law.unlockReq.realm && S.realm.stage >= law.unlockReq.stage){
        S.laws.unlocked.push(lawKey);
        log(`${law.name} is now available for selection!`, 'good');
      }
    }
  }
}

function awardLawPoints(){
  // Award law points based on realm progression
  let points = 0;
  if(S.realm.tier >= 2) points += 2; // Foundation+
  if(S.realm.tier >= 3) points += 3; // Core+
  if(S.realm.tier >= 4) points += 5; // Nascent+
  
  // Bonus points for major milestones
  if(S.realm.stage === 1 && S.realm.tier > 0) points += S.realm.tier;
  if(S.realm.stage === 5) points += 1;
  if(S.realm.stage === 9) points += 2;
  
  if(points > 0){
    S.laws.points += points;
    log(`Gained ${points} Law Points!`, 'good');
  }
}

function selectLaw(lawKey){
  if(!S.laws.unlocked.includes(lawKey)){
    log('Law not unlocked yet!', 'bad');
    return;
  }
  
  if(S.laws.selected === lawKey){
    log('Already following this law!', 'bad');
    return;
  }
  
  S.laws.selected = lawKey;
  const law = LAWS[lawKey];
  log(`You have chosen to follow the ${law.name}!`, 'good');
  updateAll();
}

function canLearnSkill(lawKey, skillKey){
  const skill = LAWS[lawKey].tree[skillKey];
  if(!skill) return false;
  
  // Check if already learned
  if(S.laws.trees[lawKey][skillKey]) return false;
  
  // Check law points
  if(S.laws.points < skill.cost) return false;
  
  // Check prerequisites
  if(skill.prereq){
    if(Array.isArray(skill.prereq)){
      // Multiple prerequisites - all must be met
      for(const prereq of skill.prereq){
        if(!S.laws.trees[lawKey][prereq]) return false;
      }
    } else {
      // Single prerequisite
      if(!S.laws.trees[lawKey][skill.prereq]) return false;
    }
  }
  
  return true;
}

function learnSkill(lawKey, skillKey){
  if(!canLearnSkill(lawKey, skillKey)){
    log('Cannot learn this skill yet!', 'bad');
    return;
  }
  
  const skill = LAWS[lawKey].tree[skillKey];
  S.laws.points -= skill.cost;
  S.laws.trees[lawKey][skillKey] = true;
  
  // Apply skill bonuses
  applySkillBonuses(lawKey, skillKey);
  
  log(`Learned ${skill.name}!`, 'good');
  updateAll();
}

function applySkillBonuses(lawKey, skillKey){
  const skill = LAWS[lawKey].tree[skillKey];
  const bonus = skill.bonus;
  
  // Apply various bonuses
  if(bonus.technique){
    S.combat.techniques[bonus.technique] = true;
    log(`Unlocked ${bonus.technique} technique!`, 'good');
  }
  
  if(bonus.alchemySlots){
    S.alchemy.maxSlots += bonus.alchemySlots;
  }
  
  // Apply cultivation bonuses
  if(bonus.cultivationTalent){
    S.cultivation.talent += bonus.cultivationTalent;
  }
  
  if(bonus.comprehension){
    S.cultivation.comprehension += bonus.comprehension;
  }
  
  if(bonus.foundationMult){
    S.cultivation.foundationMult += bonus.foundationMult;
  }
  
  if(bonus.pillMult){
    S.cultivation.pillMult += bonus.pillMult;
  }
}

function getLawBonuses(){
  let bonuses = {
    atk: 1, def: 1, qiRegen: 1, qiCap: 1, resourceYield: 1,
    alchemySuccess: 1, pillEffect: 1, critChance: 0, dmgReduction: 0,
    beastDmg: 1, herbYield: 1, pillQiBonus: 1, qiCost: 1
  };
  
  if(!S.laws || !S.laws.selected) return bonuses;
  
  const law = LAWS[S.laws.selected];
  const tree = S.laws.trees[S.laws.selected];
  
  // Apply base law bonuses
  if(law.bonuses.atk) bonuses.atk *= law.bonuses.atk;
  if(law.bonuses.def) bonuses.def *= law.bonuses.def;
  if(law.bonuses.qiRegen) bonuses.qiRegen *= law.bonuses.qiRegen;
  if(law.bonuses.resourceYield) bonuses.resourceYield *= law.bonuses.resourceYield;
  if(law.bonuses.alchemySuccess) bonuses.alchemySuccess *= law.bonuses.alchemySuccess;
  if(law.bonuses.pillEffectiveness) bonuses.pillEffect *= law.bonuses.pillEffectiveness;
  if(law.bonuses.critChance) bonuses.critChance += law.bonuses.critChance;
  
  // Apply skill tree bonuses
  for(const skillKey in tree){
    if(tree[skillKey]){
      const skill = law.tree[skillKey];
      const bonus = skill.bonus;
      
      if(bonus.atk) bonuses.atk *= (1 + bonus.atk);
      if(bonus.def) bonuses.def *= (1 + bonus.def);
      if(bonus.qiRegen) bonuses.qiRegen *= (1 + bonus.qiRegen);
      if(bonus.qiCap) bonuses.qiCap *= (1 + bonus.qiCap);
      if(bonus.resourceYield) bonuses.resourceYield *= (1 + bonus.resourceYield);
      if(bonus.alchemySuccess) bonuses.alchemySuccess *= (1 + bonus.alchemySuccess);
      if(bonus.pillEffect) bonuses.pillEffect *= (1 + bonus.pillEffect);
      if(bonus.critChance) bonuses.critChance += bonus.critChance;
      if(bonus.dmgReduction) bonuses.dmgReduction += bonus.dmgReduction;
      if(bonus.beastDmg) bonuses.beastDmg *= (1 + bonus.beastDmg);
      if(bonus.herbYield) bonuses.herbYield *= (1 + bonus.herbYield);
      if(bonus.pillQiBonus) bonuses.pillQiBonus *= (1 + bonus.pillQiBonus);
      if(bonus.qiCost) bonuses.qiCost *= (1 + bonus.qiCost);
    }
  }
  
  return bonuses;
}

// Sect Buildings System Functions
function isBuildingUnlocked(buildingKey) {
  const building = SECT_BUILDINGS[buildingKey];
  if (!building) return false;
  
  const req = building.unlockReq;
  return S.realm.tier >= req.realm && S.realm.stage >= req.stage;
}

function getBuildingLevel(buildingKey) {
  return S.buildings[buildingKey] || 0;
}

function getBuildingCost(buildingKey, targetLevel = null) {
  const building = SECT_BUILDINGS[buildingKey];
  if (!building) return null;
  
  const currentLevel = getBuildingLevel(buildingKey);
  const level = targetLevel || (currentLevel + 1);
  
  if (level > building.maxLevel) return null;
  
  const cost = {};
  const scaling = Math.pow(building.costScaling, level - 1);
  
  for (const [resource, amount] of Object.entries(building.baseCost)) {
    cost[resource] = Math.floor(amount * scaling);
  }
  
  return cost;
}

function canAffordBuilding(buildingKey, targetLevel = null) {
  const cost = getBuildingCost(buildingKey, targetLevel);
  if (!cost) return false;
  
  for (const [resource, amount] of Object.entries(cost)) {
    if (S[resource] < amount) return false;
  }
  
  return true;
}

function upgradeBuilding(buildingKey) {
  const building = SECT_BUILDINGS[buildingKey];
  if (!building) {
    log('Building not found!', 'bad');
    return false;
  }
  
  if (!isBuildingUnlocked(buildingKey)) {
    log('Building not unlocked yet!', 'bad');
    return false;
  }
  
  const currentLevel = getBuildingLevel(buildingKey);
  const targetLevel = currentLevel + 1;
  
  if (targetLevel > building.maxLevel) {
    log('Building already at maximum level!', 'bad');
    return false;
  }
  
  if (!canAffordBuilding(buildingKey, targetLevel)) {
    log('Cannot afford building upgrade!', 'bad');
    return false;
  }
  
  // Pay the cost
  const cost = getBuildingCost(buildingKey, targetLevel);
  for (const [resource, amount] of Object.entries(cost)) {
    S[resource] -= amount;
  }
  
  // Upgrade the building
  S.buildings[buildingKey] = targetLevel;
  
  // Apply effects
  applyBuildingEffects();
  
  const levelText = currentLevel === 0 ? 'built' : `upgraded to level ${targetLevel}`;
  log(`${building.name} ${levelText}!`, 'good');
  
  updateAll();
  return true;
}



function applyBuildingEffects() {
  // Reset building bonuses
  S.buildingBonuses = {
    qiRegenMult: 0, qiCapMult: 0, herbYield: 0, oreYield: 0, woodYield: 0,
    alchemySlots: 0, alchemySuccess: 0, atkBase: 0, defBase: 0,
    disciples: 0, lawPoints: 0, breakthroughBonus: 0, foundationMult: 0
  };
  
  // Reset cultivation building multiplier (ensure cultivation object exists)
  if (!S.cultivation) {
    S.cultivation = {
      talent: 1.0,
      comprehension: 1.0,
      foundationMult: 1.0,
      pillMult: 1.0,
      buildingMult: 1.0
    };
  }
  S.cultivation.buildingMult = 1.0;
  
  // Apply effects from all built buildings
  for (const [buildingKey, level] of Object.entries(S.buildings)) {
    if (level > 0) {
      const building = SECT_BUILDINGS[buildingKey];
      if (building && building.effects[level]) {
        const effects = building.effects[level];
        
        for (const [effect, value] of Object.entries(effects)) {
          if (effect === 'alchemyUnlock' && value) {
            S.alchemy.unlocked = true;
            log('Alchemy unlocked! You can now brew pills.', 'good');
            updateTabVisibility(); // Show alchemy tab
          } else if (effect !== 'desc' && S.buildingBonuses.hasOwnProperty(effect)) {
            S.buildingBonuses[effect] += value;
          }
        }
      }
    }
  }
  
  // Apply accumulated bonuses to base stats
  S.qiRegenMult += S.buildingBonuses.qiRegenMult;
  S.qiCapMult += S.buildingBonuses.qiCapMult;
  S.yieldMult.herbs += S.buildingBonuses.herbYield;
  S.yieldMult.ore += S.buildingBonuses.oreYield;
  S.yieldMult.wood += S.buildingBonuses.woodYield;
  S.alchemy.maxSlots += S.buildingBonuses.alchemySlots;
  S.alchemy.successBonus += S.buildingBonuses.alchemySuccess;
  S.atkBase += S.buildingBonuses.atkBase;
  S.defBase += S.buildingBonuses.defBase;
  S.disciples += S.buildingBonuses.disciples;
  S.cultivation.buildingMult += S.buildingBonuses.foundationMult;
  
  // Law points are added directly when building is upgraded
  if (S.buildingBonuses.lawPoints > 0) {
    S.laws.points += S.buildingBonuses.lawPoints;
    S.buildingBonuses.lawPoints = 0; // Reset to avoid double-adding
  }
}

function freeDisciples(){ return S.disciples - (S.gather.herbs + S.gather.ore + S.gather.wood); }
function assign(type, delta){
  if(delta>0){ const free=freeDisciples(); const add=Math.min(delta, free); S.gather[type]+=add; }
  else{ const take=Math.min(-delta, S.gather[type]); S.gather[type]-=take; }
  updateAll();
}
function yieldBase(type){
  const lawBonuses = getLawBonuses();
  const base = 0.8 + S.realm.tier*0.3;
  let multiplier = (1 + S.yieldMult[type] + S.karma.yield*2) * lawBonuses.resourceYield;
  
  // Apply specific yield bonuses
  if(type === 'herbs') multiplier *= lawBonuses.herbYield;
  
  return base * multiplier;
}

// Alchemy
const RECIPES = {
  qi:{name:'Qi Condensing Pill', cost:{herbs:20, ore:5}, time:30, base:0.80, give:s=>{s.pills.qi++; s.alchemy.xp+=5;}, unlockHint:'Basic alchemy knowledge'},
  body:{name:'Body Tempering Pill', cost:{herbs:10, ore:20, wood:10}, time:45, base:0.70, give:s=>{s.pills.body++; s.alchemy.xp+=7;}, unlockHint:'Found in ancient texts or learned from masters'},
  ward:{name:'Tribulation Ward Pill', cost:{herbs:50, ore:25, wood:25}, time:120, base:0.60, give:s=>{s.pills.ward++; s.alchemy.xp+=12;}, unlockHint:'Advanced recipe requiring deep cultivation knowledge'}
};
function addBrew(){
  if(!S.alchemy.unlocked) { log('Alchemy not unlocked yet! Build an Alchemy Laboratory.','bad'); return; }
  if(S.alchemy.queue.length>=S.alchemy.maxSlots){ log('Queue is full','bad'); return; }
  const key = document.getElementById('recipeSelect').value; const r=RECIPES[key];
  if(!S.alchemy.knownRecipes.includes(key)) { log('Recipe not known yet!','bad'); return; }
  if(!pay(r.cost)) { log('Not enough materials','bad'); return; }
  S.alchemy.queue.push({key, name:r.name, t:r.time, T:r.time, done:false});
  updateAll();
}
function collectBrew(i){
  const q=S.alchemy.queue[i]; if(!q || !q.done) return;
  const r=RECIPES[q.key]; const chance = r.base + S.alchemy.successBonus;
  if(Math.random()<chance){ r.give(S); log(`Brewed ${q.name} successfully!`,'good'); }
  else { log(`${q.name} failed. You salvage some scraps.`, 'bad'); S.herbs+=Math.floor((r.cost.herbs||0)*0.3); S.ore+=Math.floor((r.cost.ore||0)*0.3); S.wood+=Math.floor((r.cost.wood||0)*0.3); }
  S.alchemy.queue.splice(i,1);
  if(S.alchemy.xp>= 30 + 20*(S.alchemy.level-1)){ S.alchemy.level++; S.alchemy.xp=0; log('Alchemy leveled up!','good'); }
  updateAll();
}

// Upgrades
function canPay(cost){ return Object.entries(cost).every(([k,v])=> (S[k]||0) >= v); }
function pay(cost){ if(!canPay(cost)) return false; Object.entries(cost).forEach(([k,v])=> S[k]-=v); return true; }
function buy(u){ if(S.bought[u.key]) return false; if(!pay(u.cost)) { log('Not enough resources','bad'); return false; } u.apply(S); S.bought[u.key]=true; log(`Bought ${u.name}`,'good'); return true; }

// Pills
function usePill(type){
  if(S.pills[type]<=0){ log('No pill available','bad'); return; }
  if(type==='qi'){ const add = Math.floor(qCap()*0.25); S.qi=clamp(S.qi+add,0,qCap()); }
  if(type==='body'){ S.tempAtk+=4; S.tempDef+=3; setTimeout(()=>{ S.tempAtk=Math.max(0,S.tempAtk-4); S.tempDef=Math.max(0,S.tempDef-3); updateAll(); }, 60000); }
  if(type==='ward'){ /* consumed during breakthrough */ }
  S.pills[type]--; updateAll();
}

// Combat
function startHunt(){
  if(S.combat.hunt){ log('Already hunting','bad'); return; }
  const i= +document.getElementById('beastSelect').value; const b=BEASTS[i];
  const KEYS = ['Armored','Frenzied','Regenerating','Giant','Swift'];
  const aff = [];
  const affCount = Math.floor(Math.random()*3);
  const h = {i, name:b.name, base:b, affixes:aff, enemyMax:b.hp, enemyHP:b.hp, eAtk:b.atk, eDef:b.def, regen:0};
  let chosen=[...KEYS];
  for(let k=0;k<affCount;k++){
    const idx=Math.floor(Math.random()*chosen.length); const key=chosen.splice(idx,1)[0]; aff.push(key);
    if(key==='Armored') h.eDef *= 1.4;
    if(key==='Frenzied') h.eAtk *= 1.35;
    if(key==='Regenerating') h.regen += 0.02;
    if(key==='Giant'){ h.enemyMax = Math.floor(h.enemyMax*1.6); h.enemyHP = h.enemyMax; }
    if(key==='Swift') h.eAtk *= 1.15;
  }
  S.combat.hunt = h; updateHuntUI();
}

function updateHuntUI(){
  const h=S.combat.hunt; const el=qs('#huntStatus');
  if(!h){ el.textContent='No active hunt.'; setText('enemyHpTxt','—'); setText('ourHpTxt','—'); setFill('enemyFill',0); setFill('ourFill',0); setText('affixList','None'); setText('techStatus',''); return; }
  const b=h.base; el.textContent=`Fighting ${b.name}…`;
  setFill('enemyFill', h.enemyHP/h.enemyMax); setText('enemyHpTxt', `${Math.ceil(h.enemyHP)}/${h.enemyMax}`);
  setFill('ourFill', S.hp/S.hpMax); setText('ourHpTxt', `${Math.ceil(S.hp)}/${S.hpMax}`);
  setText('affixList', h.affixes.length? h.affixes.join(', '): 'None');
  const cd = S.combat.cds; setText('techStatus', `Slash ${cd.slash||0}s • Guard ${cd.guard||0}s • Burst ${cd.burst||0}s`);
}
function resolveHunt(win){
  const h=S.combat.hunt; if(!h) return; const b=h.base;
  if(win){
    Object.entries(b.reward).forEach(([k,v])=>{ S[k]=(S[k]||0)+v; });
    S.stones += Math.ceil((S.realm.tier+1)*2);
    const bonus = h.affixes.length*0.05; const chance = 0.25 + 0.05*b.atk/10 + bonus; if(Math.random()<chance) S.cores += 1;
    log(`Victory vs ${b.name}! Loot gained.`,'good');
  }else{
    S.hp = Math.max(1, S.hp - Math.ceil(S.hpMax*0.25));
    log(`Defeated by ${b.name}. You limp back, hurt.`,'bad');
  }
  S.combat.hunt=null; updateAll();
}

function techSlash(){
  if(!S.combat.hunt){ log('No active hunt','bad'); return; }
  if(S.combat.cds.slash>0){ log('Sword Slash on cooldown','bad'); return; }
  const dmg = calcAtk()*3;
  S.combat.hunt.enemyHP = Math.max(0, S.combat.hunt.enemyHP - dmg);
  S.combat.cds.slash = 8; log('You unleash Sword Slash!','good'); updateHuntUI();
}
function techGuard(){
  if(!S.combat.hunt){ log('No active hunt','bad'); return; }
  if(S.combat.cds.guard>0){ log('Guard on cooldown','bad'); return; }
  S.combat.guardUntil = S.time + 5; S.combat.cds.guard = 20; log('You assume a guarded stance (5s).','good'); updateHuntUI();
}
function techBurst(){
  if(!S.combat.hunt){ log('No active hunt','bad'); return; }
  if(S.combat.cds.burst>0){ log('Qi Burst on cooldown','bad'); return; }
  const need = 0.25*qCap(); if(S.qi < need){ log('Not enough Qi for Burst (25% required)','bad'); return; }
  S.qi -= need; const dmg = need/3 + calcAtk(); S.combat.hunt.enemyHP = Math.max(0, S.combat.hunt.enemyHP - dmg); S.combat.cds.burst = 15; log('Qi Burst detonates!','good'); updateHuntUI();
}

function updateWinEst(){
  const i= +document.getElementById('beastSelect').value; const b=BEASTS[i]; if(!b){ setText('winEst','—'); return; }
  const atk = calcAtk(); const def = calcDef(); const ourDPS = Math.max(1, atk - b.def*0.6); const enemyDPS = Math.max(0, b.atk - def*0.7);
  const tKill = b.hp/ourDPS; const tDie = S.hp / Math.max(0.1, enemyDPS);
  const p = clamp(0.5 + (tDie - tKill)/ (tDie + tKill + 1e-6), 0, 0.99);
  setText('winEst', Math.round(p*100)+'%');
}

/* Ascension */
function calcKarmaGain(){
  let score = (S.realm.tier*9 + (S.realm.stage-1)) - 3; return Math.max(0, Math.floor(score/6));
}
document.getElementById('ascendBtn').addEventListener('click', ()=>{
  const gain = calcKarmaGain();
  if(!confirm(`Ascend now and earn ${gain} karma? This resets most progress.`)) return;
  S.karmaPts += gain; S.ascensions++;
  const keep = {karmaPts:S.karmaPts, ascensions:S.ascensions, karma:S.karma};
  S = Object.assign(defaultState(), keep);
  save(); location.reload();
});

/* Loop */
function tick(){
  S.time++;

  // Passive Qi & HP regen
  S.qi = clamp(S.qi + qiRegenPerSec(), 0, qCap());
  const multHeal = 0.01 + S.realm.tier*0.002;
  S.hp = clamp(S.hp + S.hpMax*multHeal, 0, S.hpMax);

  // Gathering
  S.herbs += yieldBase('herbs') * S.gather.herbs;
  S.ore   += yieldBase('ore')   * S.gather.ore;
  S.wood  += yieldBase('wood')  * S.gather.wood;

  // Alchemy
  S.alchemy.queue.forEach(q=>{ if(!q.done){ q.t -= 1; if(q.t<=0){ q.t=0; q.done=true; } }});

  // Auto meditation - continuous foundation gain
  if(S.auto.meditate) {
    const gain = foundationGainPerSec();
    S.foundation = clamp(S.foundation + gain, 0, fCap());
  }
  if(S.auto.brewQi && S.alchemy.queue.length < S.alchemy.maxSlots){ if(canPay(RECIPES.qi.cost)) addBrew(); }
  if(S.auto.hunt && !S.combat.hunt){ startHunt(); }

  // Combat step
  if(S.combat.hunt){
    const h=S.combat.hunt;
    const guardActive = S.time < S.combat.guardUntil;
    const atk = calcAtk(), def = calcDef();
    const ourDPS = Math.max(1, atk - h.eDef*0.6);
    let enemyDPS = Math.max(0, h.eAtk - def*0.7);
    if(guardActive) enemyDPS *= 0.5;
    h.enemyHP -= ourDPS;
    if(h.regen) h.enemyHP += h.enemyMax * h.regen;
    h.enemyHP = clamp(h.enemyHP, 0, h.enemyMax);
    S.hp = clamp(S.hp - enemyDPS, 0, S.hpMax);
    if(h.enemyHP<=0){ resolveHunt(true); }
    else if(S.hp<=1){ resolveHunt(false); }
    updateHuntUI();
  }

  // CDs
  for(const k in S.combat.cds){ if(S.combat.cds[k]>0) S.combat.cds[k]--; }

  if(S.time % 2===0) updateWinEst();
  updateAll();
}

function log(msg, cls=''){
  const el=document.getElementById('log'); const p=document.createElement('p'); if(cls) p.className=cls; p.textContent=`${timeStr()} ${msg}`; el.appendChild(p); el.scrollTop=el.scrollHeight;
}
function timeStr(){ const s=S.time; const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60; return `[${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}]`; }

function save(){ try{ localStorage.setItem('woa-save', JSON.stringify(S)); }catch(e){} }
function load(){ try{ const t=localStorage.getItem('woa-save'); return t? JSON.parse(t):null; }catch(e){ return null; } }

// Init
window.addEventListener('load', ()=>{
  // Tabs at boot
  const nav = document.getElementById('tabs');
  TABS.forEach((t,i)=>{
    // already added in initUI, but ensure content sections exist
  });
  initUI();
  initLawSystem();
  log('Welcome, cultivator.');
  setInterval(tick, 1000);
});
