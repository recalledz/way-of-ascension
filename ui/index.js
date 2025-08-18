/* eslint-disable no-unused-vars */
/* global updateYinYangVisual, updateBreathingStats, updateLotusFoundationFill, showActivity, switchTab, showTab */

// Way of Ascension — Modular JS

import { LAWS } from '../data/laws.js';
import { S, defaultState, save, setState } from '../src/game/state.js';
import {
  clamp,
  qCap,
  qiRegenPerSec,
  fCap,
  foundationGainPerSec,
  foundationGainPerMeditate,
  powerMult,
  calcAtk,
  calcDef,
  getWeaponProficiencyBonuses,
  calculatePlayerCombatAttack,
  calculatePlayerAttackRate
} from '../src/game/engine.js';
import { initializeFight, processAttack } from '../src/game/combat.js';
import { applyRandomAffixes } from '../src/game/affixes.js';
import {
  updateRealmUI,
  updateActivityCultivation,
  updateBreakthrough,
  checkLawUnlocks,
  initRealmUI,
  getRealmName
} from './realm.js';
import { qs, setText, setFill, log } from '../src/game/utils.js';
import { createProgressBar, updateProgressBar } from './components/progressBar.js';
import { renderSidebarActivities } from '../src/ui/sidebar.js';
import { initializeWeaponChip, updateWeaponChip } from '../src/ui/weaponChip.js';
import {
  updateActivityAdventure,
  updateAdventureCombat,
  startAdventureCombat,
  startBossCombat,
  progressToNextArea,
  retreatFromCombat,
  updateWeaponProficiencyDisplay,
  updateFoodSlots,
  instakillCurrentEnemy,
  setupAdventureTabs,
  updateLootTab

} from '../src/game/adventure.js';
import { forfeitSessionLoot } from '../src/game/systems/sessionLoot.js'; // EQUIP-CHAR-UI
import { renderCharacterPanel, setupCharacterTab } from '../src/ui/panels/CharacterPanel.js'; // EQUIP-CHAR-UI
import { ZONES } from '../data/zones.js'; // MAP-UI-UPDATE
import { setReduceMotion } from '../src/ui/fx/fx.js';

// Global variables
const progressBars = {};
let selectedActivity = 'cultivation'; // Current selected activity for the sidebar



const BEASTS = [
  {name:'Wild Rabbit', hp:60, atk:2, def:0, reward:{stones:5, herbs:2}},
  {name:'Boar', hp:180, atk:5, def:2, reward:{stones:15, ore:3}},
  {name:'Spirit Wolf', hp:420, atk:10, def:4, reward:{stones:35, wood:6}},
  {name:'Tiger', hp:900, atk:18, def:8, reward:{stones:80, ore:12}},
  {name:'Dragon Whelp', hp:2400, atk:40, def:18, reward:{stones:220, herbs:30, ore:25}}
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

// Import enemy data from the enemies module
import { ENEMY_DATA } from '../data/enemies.js';

// Adventure System Data
// Enemy data for adventure zones

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

function initUI(){
  // Render sidebar activities
  renderSidebarActivities();

  initializeWeaponChip();

  // Fill beasts
  const bs = document.getElementById('beastSelect');
  BEASTS.forEach((b,i)=>{const o=document.createElement('option'); o.value=i; o.textContent=`${b.name} (HP ${b.hp})`; bs.appendChild(o)});

  // Assign buttons
  document.getElementById('tab-gathering').addEventListener('click', e=>{
    const d = e.target.dataset.assign; if(!d) return; const [res,op]=d.split(':'); const delta=+op; assign(res, delta);
  });

  // Buttons (with safe null checks)
  const meditateBtn = qs('#meditateBtn');
  if (meditateBtn) meditateBtn.addEventListener('click', meditate);
  initRealmUI();
  
  const brewBtn = qs('#brewBtn');
  if (brewBtn) brewBtn.addEventListener('click', addBrew);
  
  const huntBtn = qs('#huntBtn');
  if (huntBtn) huntBtn.addEventListener('click', startHunt);
  
  const useQiPill = qs('#useQiPill');
  if (useQiPill) useQiPill.addEventListener('click', ()=>usePill('qi'));
  
  const useBodyPill = qs('#useBodyPill');
  if (useBodyPill) useBodyPill.addEventListener('click', ()=>usePill('body'));
  
  const useWardPill = qs('#useWardPill');
  if (useWardPill) useWardPill.addEventListener('click', ()=>usePill('ward'));

  // Autos (with safe null checks)
  const autoMeditate = qs('#autoMeditate');
  if (autoMeditate) {
    autoMeditate.checked = S.auto.meditate;
    autoMeditate.addEventListener('change', e => S.auto.meditate = e.target.checked);
  }
  
  const autoBrewQi = qs('#autoBrewQi');
  if (autoBrewQi) {
    autoBrewQi.checked = S.auto.brewQi;
    autoBrewQi.addEventListener('change', e => S.auto.brewQi = e.target.checked);
  }
  
  const autoHunt = qs('#autoHunt');
  if (autoHunt) {
    autoHunt.checked = S.auto.hunt;
    autoHunt.addEventListener('change', e => S.auto.hunt = e.target.checked);
  }

  const reduceMotionToggle = qs('#reduceMotionToggle');
  if (reduceMotionToggle) {
    const stored = localStorage.getItem('reduce-motion') === '1';
    reduceMotionToggle.checked = stored;
    setReduceMotion(stored);
    reduceMotionToggle.addEventListener('change', e => {
      const v = e.target.checked;
      localStorage.setItem('reduce-motion', v ? '1' : '0');
      setReduceMotion(v);
    });
  }

  // Save/Load (with safe null checks)
  const saveBtn = qs('#saveBtn');
  if (saveBtn) saveBtn.addEventListener('click', save);
  
  const resetBtn = qs('#resetBtn');
  if (resetBtn) resetBtn.addEventListener('click', ()=>{ if(confirm('Hard reset?')){ setState(defaultState()); save(); location.reload(); }});
  const exportBtn = qs('#exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', ()=>{
      const blob=new Blob([JSON.stringify(S)],{type:'application/json'}); const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download='way-of-ascension-save.json'; a.click(); URL.revokeObjectURL(url);
    });
  }
  
  const importBtn = qs('#importBtn');
  if (importBtn) {
    importBtn.addEventListener('click', async()=>{
      const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json';
      inp.onchange=()=>{ const f=inp.files[0]; const r=new FileReader(); r.onload=()=>{ try{ setState(JSON.parse(r.result)); save(); location.reload(); }catch{ alert('Invalid file'); } }; r.readAsText(f); };
      inp.click();
    });
  }
  const debugBtn = qs('#debugBtn');
  const debugConsole = qs('#debugConsole');
  if (debugBtn && debugConsole) {
    debugBtn.addEventListener('click', () => {
      debugConsole.style.display = debugConsole.style.display === 'none' ? 'block' : 'none';
    });
  }

  const debugRunBtn = qs('#debugRunBtn');
  if (debugRunBtn) {
    debugRunBtn.addEventListener('click', () => {
      const input = qs('#debugInput');
      const output = qs('#debugOutput');
      try {
        const result = eval(input.value);
        if (output) output.textContent = String(result);
      } catch (err) {
        if (output) output.textContent = err.message;
      }
    });
  }

  const debugKillBtn = qs('#debugKillBtn');
  if (debugKillBtn) debugKillBtn.addEventListener('click', instakillCurrentEnemy);


  // Safe render calls - only call functions that exist
  if (typeof renderUpgrades === 'function') renderUpgrades();
  if (typeof renderSect === 'function') renderSect();
  renderKarma();
  updateAll();
}

function updateAll(){
  updateRealmUI();

  // Qi
  setText('qiVal', fmt(S.qi)); setText('qiCap', fmt(qCap()));
  setText('qiValL', fmt(S.qi)); setText('qiCapL', fmt(qCap()));
  setText('qiRegen', qiRegenPerSec().toFixed(1));
  setFill('qiFill', S.qi / qCap());
  setFill('qiFill2', S.qi / qCap());
  setText('qiPct', Math.floor(100 * S.qi / qCap()) + '%');
  
  // Foundation
  setFill('cultivationProgressFill', S.foundation / fCap());
  setText('cultivationProgressText', `${fmt(S.foundation)} / ${fmt(fCap())}`);
  setText('foundValL', fmt(S.foundation)); setText('foundCapL', fmt(fCap()));
  setFill('foundFill', S.foundation / fCap());
  setFill('foundFill2', S.foundation / fCap());
  setText('foundPct', Math.floor(100 * S.foundation / fCap()) + '%');
  
  // HP
  setText('hpVal', fmt(S.hp)); setText('hpMax', fmt(S.hpMax));
  setText('hpValL', fmt(S.hp)); setText('hpMaxL', fmt(S.hpMax));
  setFill('hpFill', S.hp / S.hpMax);
  
  // Combat stats
  setText('atkVal', calcAtk()); setText('defVal', calcDef());
  setText('atkVal2', calcAtk()); setText('defVal2', calcDef());
  
  // Activity system display
  if (!S.activities) {
    S.activities = { cultivation: false, physique: false, mining: false, adventure: false, cooking: false };
  }
  updateCurrentTaskDisplay();

    updateWeaponChip();

  // Update progression displays
  setFill('physiqueProgressFill', S.physique.exp / S.physique.expMax);
  setText('physiqueProgressText', `${fmt(S.physique.exp)} / ${fmt(S.physique.expMax)} XP`);
  setText('physiqueLevel', `Level ${S.physique.level}`);

  setFill('miningProgressFill', S.mining.exp / S.mining.expMax);
  setText('miningProgressText', `${fmt(S.mining.exp)} / ${fmt(S.mining.expMax)} XP`);
  setText('miningLevel', `Level ${S.mining.level}`);

  setFill('cookingProgressFillSidebar', S.cooking.exp / S.cooking.expMax);
  setText('cookingProgressTextSidebar', `${fmt(S.cooking.exp)} / ${fmt(S.cooking.expMax)} XP`);
  setText('cookingLevelSidebar', `Level ${S.cooking.level}`);

  const currentZone = ZONES[S.adventure.currentZone];
  const currentArea = currentZone ? currentZone.areas[S.adventure.currentArea] : null;
  const location = currentArea ? currentArea.name : 'Village Outskirts';
  if (currentArea) {
    const progress = S.adventure.killsInCurrentArea / currentArea.killReq;
    setFill('adventureProgressFill', progress);
    setText('adventureProgressText', `${Math.floor(progress * 100)}%`);
  }
  setText('adventureLevel', location);
  
  setText('buildingCount', Object.values(S.buildings).filter(level => level > 0).length);
  setText('stonesDisplay', fmt(S.stones));
  
  // Safe call to updateActivityUI if it exists
  if (typeof updateActivityUI === 'function') updateActivityUI();
  
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
  
  // Karma
  setText('karmaVal', S.karmaPts);
  const ascendBtn = document.getElementById('ascendBtn');
  if (ascendBtn) ascendBtn.disabled = calcKarmaGain() <= 0;
  
  // Laws
  if (typeof updateLawsDisplay === 'function') updateLawsDisplay();
  
  // Safe render function calls
  renderKarma(); 
  if (typeof renderQueue === 'function') renderQueue(); 
  if (typeof renderAlchemyUI === 'function') renderAlchemyUI(); 
  if (typeof renderBuildings === 'function') renderBuildings();

  if (typeof updateQiOrbEffect === 'function') updateQiOrbEffect();
  if (typeof updateYinYangVisual === 'function') updateYinYangVisual();
  if (typeof updateBreathingStats === 'function') updateBreathingStats();
  if (typeof updateLotusFoundationFill === 'function') updateLotusFoundationFill();
  updateActivityCards();
}


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
        const realmName = getRealmName(req.realm);
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
  const body=document.getElementById('karmaUpgrades'); 
  if (!body) return; 
  
  body.innerHTML='';
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

// Activity Management System

function selectActivity(activityType) {
  selectedActivity = activityType;
  
  // Update activity item styling for new compact sidebar
  const activityItems = document.querySelectorAll('.activity-item');
  activityItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.activity === activityType) {
      item.classList.add('active');
    }
  });
  
  // Hide all activity content panels
  const activityPanels = document.querySelectorAll('.activity-content');
  activityPanels.forEach(panel => panel.style.display = 'none');
  
  // Hide all tabs
  const tabs = document.querySelectorAll('section[id^="tab-"]');
  tabs.forEach(tab => tab.style.display = 'none');
  
  // Show selected activity panel
  const selectedPanel = document.getElementById(`activity-${activityType}`);
  if (selectedPanel) {
    selectedPanel.style.display = 'block';
  }
  
  // Update sidebar selectors
  updateActivitySelectors();
  updateActivityContent();
  
  log(`Switched to ${activityType} view`, 'neutral');
}

// Combat calculation functions






function startActivity(activityName) {
  // Stop all other activities first (strict exclusivity)
  Object.keys(S.activities).forEach(key => {
    if (key !== activityName) {
      S.activities[key] = false;
    }
  });
  
  // Stop any active physique training session
  if (S.physique && S.physique.training) {
    S.physique.training.active = false;
  }
  
  if (activityName === 'physique') {
    // Initialize physique training data
    if (!S.physique.training) {
      S.physique.training = {
        active: false,
        stamina: 100,
        maxStamina: 100,
        cursor: { position: 50, direction: 1, speed: 2 },
        streak: 0,
        sessionXP: 0
      };
    }
  } else if (activityName === 'mining') {
    // Initialize mining data
    if (!S.mining.selectedResource) {
      S.mining.selectedResource = 'stones';
    }
  } else if (activityName === 'adventure') {
    // Initialize adventure and start first combat
    if (!S.adventure) {
      const { enemyHP, enemyMax } = initializeFight({ hp: 0 });
      S.adventure = {
        currentZone: 0,
        currentArea: 0,
        totalKills: 0,
        areasCompleted: 0,
        zonesUnlocked: 1,
        killsInCurrentArea: 0,
        inCombat: false,
        playerHP: S.hp,
        enemyHP,
        enemyMaxHP: enemyMax,
        currentEnemy: null,
        lastPlayerAttack: 0,
        lastEnemyAttack: 0,
        combatLog: []
      };
    }
    
    // Start first combat encounter
    setTimeout(() => startAdventureCombat(), 1000);
  }
  
  // Start the requested activity
  S.activities[activityName] = true;
  
  // Log appropriate message
  switch(activityName) {
    case 'cultivation':
      log('Started cultivating. Foundation will increase over time.', 'good');
      break;
    case 'physique':
      log('Started physique training. Use the training interface to gain experience!', 'good');
      break;
    case 'mining':
      log('Started mining operations. Select a resource to mine passively.', 'good');
      break;
    case 'adventure':
      log('Started exploring. Adventure awaits!', 'good');
      break;
    case 'cooking':
      log('Started cooking. Prepare your meals carefully.', 'good');
      break;
    default:
      log(`Started ${activityName}`, 'good');
  }
  
  updateActivitySelectors();
  updateActivityContent();
}

function stopActivity(activityName) {
  S.activities[activityName] = false;
  
  // Stop any active physique training session
  if (activityName === 'physique' && S.physique) {
    S.physique.trainingSession = false;
    S.physique.timingActive = false;
  }
  if (activityName === 'cultivation' && S.auto) {
    // Ensure passive meditation doesn't continue when cultivation is stopped
    S.auto.meditate = false;
  }
  
  log(`Stopped ${activityName}`, 'neutral');
  updateActivitySelectors();
  updateActivityContent();
}

// Expose activity controls globally so other modules like realm.js can access
// them when binding UI event handlers. Without this, the cultivation start/stop
// button fails to toggle the activity state.
window.startActivity = startActivity;
window.stopActivity = stopActivity;

function updateCurrentTaskDisplay() {
  const el = document.getElementById('currentTask');
  if (!el) return;
  const names = {
    cultivation: 'Cultivating',
    physique: 'Physique Training',
    mining: 'Mining',
    adventure: 'Adventuring',
    cooking: 'Cooking'
  };
  const active = S.activities ? Object.keys(S.activities).find(key => S.activities[key]) : null;
  el.textContent = active ? (names[active] || 'Idle') : 'Idle';
}

function updateActivitySelectors() {
  // Ensure physique and mining data structures exist
  if (!S.physique) {
    S.physique = { level: 1, exp: 0, expMax: 100 };
  }
  if (!S.mining) {
    S.mining = { level: 1, exp: 0, expMax: 100 };
  }
  
  // Update cultivation selector
  const cultivationSelector = document.getElementById('cultivationSelector');
  const cultivationFill = document.getElementById('cultivationFill');
  const cultivationInfo = document.getElementById('cultivationInfo');
  
  if (cultivationSelector) {
    cultivationSelector.classList.toggle('active', selectedActivity === 'cultivation');
    cultivationSelector.classList.toggle('running', S.activities.cultivation);
  }
  
  if (cultivationFill && cultivationInfo) {
    const foundationPct = S.foundation / fCap() * 100;
    cultivationFill.style.width = `${foundationPct}%`;
    cultivationInfo.textContent = S.activities.cultivation ? 'Cultivating...' : 'Foundation Progress';
  }
  
  // Update physique selector
  const physiqueSelector = document.getElementById('physiqueSelector');
  const physiqueFill = document.getElementById('physiqueSelectorFill');
  const physiqueInfo = document.getElementById('physiqueInfo');
  
  if (physiqueSelector) {
    physiqueSelector.classList.toggle('active', selectedActivity === 'physique');
    physiqueSelector.classList.toggle('running', S.activities.physique);
  }
  
  if (physiqueFill && physiqueInfo) {
    const expPct = S.physique.exp / S.physique.expMax * 100;
    physiqueFill.style.width = `${expPct}%`;
    physiqueInfo.textContent = S.activities.physique ? 'Training...' : `Level ${S.physique.level}`;
  }
  
  // Update mining selector
  const miningSelector = document.getElementById('miningSelector');
  const miningFill = document.getElementById('miningSelectorFill');
  const miningInfo = document.getElementById('miningInfo');
  
  if (miningSelector) {
    miningSelector.classList.toggle('active', selectedActivity === 'mining');
    miningSelector.classList.toggle('running', S.activities.mining);
  }
  
  if (miningFill && miningInfo) {
    const expPct = S.mining.exp / S.mining.expMax * 100;
    miningFill.style.width = `${expPct}%`;
    miningInfo.textContent = S.activities.mining ? 'Mining...' : `Level ${S.mining.level}`;
  }
  
  // Update adventure selector
  const adventureSelector = document.getElementById('adventureSelector');
  const adventureInfo = document.getElementById('adventureInfo');
  
  if (adventureSelector) {
    adventureSelector.classList.toggle('active', selectedActivity === 'adventure');
    adventureSelector.classList.toggle('running', S.activities.adventure);
  }
  
  if (adventureInfo) {
    const location = S.adventure && S.adventure.location ? S.adventure.location : 'Village Outskirts';
    adventureInfo.textContent = S.activities.adventure ? 'Exploring...' : location;
  }
  
  // Update sect selector
  const sectSelector = document.getElementById('sectSelector');
  const sectInfo = document.getElementById('sectInfo');
  
  if (sectSelector) {
    sectSelector.classList.toggle('active', selectedActivity === 'sect');
  }
  
  if (sectInfo) {
    const buildingCount = Object.values(S.buildings).reduce((sum, level) => sum + (level > 0 ? 1 : 0), 0);
    sectInfo.textContent = `${buildingCount} Buildings`;
  }
  updateCurrentTaskDisplay();
}

function updateActivityContent() {
  // Update cultivation activity content
  updateActivityCultivation();
  updateActivityPhysique();
  switch(selectedActivity) {
    case 'adventure':
      updateActivityAdventure();
      break;
    case 'character':
      renderCharacterPanel(); // EQUIP-CHAR-UI
      break;
    case 'cooking':
      updateActivityCooking();
      break;
    case 'sect':
      updateActivitySect();
      break;
  }
}

function updateActivityPhysique() {
  // Only update if physique activity is initialized
  if (!S.physique) {
    // Show placeholder values when physique isn't initialized
    setText('physiqueLevelActivity', '1');
    setText('physiqueExpActivity', '0');
    setText('physiqueExpMaxActivity', '100');
    setText('currentStamina', '100');
    setText('maxStamina', '100');
    return;
  }
  
  // Ensure stamina values are valid numbers
  if (isNaN(S.physique.stamina)) S.physique.stamina = 100;
  if (isNaN(S.physique.maxStamina)) S.physique.maxStamina = 100;
  
  setText('physiqueLevelActivity', S.physique.level || 1);
  setText('physiqueExpActivity', Math.floor(S.physique.exp || 0));
  setText('physiqueExpMaxActivity', S.physique.expMax || 100);
  setText('currentStamina', Math.floor(S.physique.stamina || 100));
  setText('maxStamina', S.physique.maxStamina || 100);
  
  const physiqueFillActivity = document.getElementById('physiqueFillActivity');
  if (physiqueFillActivity) {
    const expPercent = ((S.physique.exp || 0) / (S.physique.expMax || 100)) * 100;
    physiqueFillActivity.style.width = expPercent + '%';
  }
  
  const staminaFill = document.getElementById('staminaFill');
  if (staminaFill) {
    const staminaPercent = ((S.physique.stamina || 100) / (S.physique.maxStamina || 100)) * 100;
    staminaFill.style.width = staminaPercent + '%';
  }
  
  const startBtn = document.getElementById('startPhysiqueActivity');
  if (startBtn) {
    startBtn.textContent = S.activities.physique ? '🛑 Stop Training' : '💪 Start Training';
    startBtn.onclick = () => S.activities.physique ? stopActivity('physique') : startActivity('physique');
  }
  
  // Show/hide training cards based on activity state
  const activeCard = document.getElementById('activeTrainingCard');
  const passiveCard = document.getElementById('passiveTrainingCard');
  const effectsCard = document.getElementById('physiqueEffectsCard');
  
  if (activeCard) {
    activeCard.style.display = S.activities.physique ? 'block' : 'none';
  }
  
  if (passiveCard) {
    passiveCard.style.display = S.activities.physique ? 'block' : 'none';
  }
  
  if (effectsCard) {
    effectsCard.style.display = S.activities.physique ? 'block' : 'none';
  }
  
  if (S.activities.physique) {
    // Update session controls visibility
    const sessionControls = document.getElementById('sessionControls');
    const trainingGame = document.getElementById('trainingGame');
    
    if (sessionControls && trainingGame) {
      if (S.physique.trainingSession) {
        sessionControls.style.display = 'none';
        trainingGame.style.display = 'block';
        
        // Update session stats
        setText('sessionStamina', Math.floor(S.physique.sessionStamina || 0));
        setText('sessionHits', S.physique.sessionHits || 0);
        setText('sessionXP', Math.floor(S.physique.sessionXP || 0));
      } else {
        sessionControls.style.display = 'block';
        trainingGame.style.display = 'none';
      }
    }
    
    // Update start session button
    const startSessionBtn = document.getElementById('startTrainingSession');
    if (startSessionBtn) {
      const canStart = S.physique.stamina >= 20;
      startSessionBtn.disabled = !canStart;
      startSessionBtn.textContent = canStart ? '🚀 Start Training Session' : '😴 Need 20+ Stamina';
    }
    
    // Update passive training stats (reduced to 1/3)
    const passiveRate = (2 + (S.physique.level * 0.2)) / 3;
    setText('passiveTrainingRate', `+${passiveRate.toFixed(1)} XP/sec`);
    setText('passiveXpGained', `${Math.floor(S.physique.passiveXpGained || 0)} XP`);
    
    // Update physique effects display
    const currentPhysique = S.stats.physique || 10;
    const miningBonus = Math.floor((currentPhysique - 10) * 2);
    const combatPower = Math.floor((currentPhysique - 10) * 1.5);
    const carryCapacity = Math.floor((currentPhysique - 10) * 5);
    
    setText('currentPhysiqueStat', currentPhysique);
    setText('physiqueMiningStat', `+${Math.max(0, miningBonus)}%`);
    setText('physiqueCombatStat', `+${Math.max(0, combatPower)}`);
    setText('physiqueCarryStat', `+${Math.max(0, carryCapacity)}`);
  }
}

function updateActivityMining() {
  // Only update if mining activity is initialized
  if (!S.mining) return;
  
  setText('miningLevelActivity', S.mining.level);
  setText('miningExpActivity', Math.floor(S.mining.exp));
  setText('miningExpMaxActivity', S.mining.expMax);
  
  // Update currently mining display
  const resourceNames = {
    stones: 'Spirit Stones',
    iron: 'Iron Ore',
    ice: 'Ice Crystal'
  };
  
  if (S.activities.mining) {
    setText('currentlyMining', resourceNames[S.mining.selectedResource] || 'Unknown');
  } else {
    setText('currentlyMining', 'Nothing');
  }
  
  const miningFillActivity = document.getElementById('miningFillActivity');
  if (miningFillActivity) {
    miningFillActivity.style.width = (S.mining.exp / S.mining.expMax * 100) + '%';
  }
  
  const startBtn = document.getElementById('startMiningActivity');
  if (startBtn) {
    startBtn.textContent = S.activities.mining ? '🛑 Stop Mining' : '⛏️ Start Mining';
    startBtn.onclick = () => S.activities.mining ? stopActivity('mining') : startActivity('mining');
  }
  
  // Update resource selection visibility based on level
  const ironOption = document.getElementById('ironOption');
  const iceOption = document.getElementById('iceOption');
  
  if (ironOption) {
    ironOption.style.display = S.mining.level >= 3 ? 'block' : 'none';
  }
  
  if (iceOption) {
    iceOption.style.display = S.mining.level >= 15 ? 'block' : 'none';
  }
  
  // Update selected resource radio button
  const selectedRadio = document.querySelector(`input[name="miningResource"][value="${S.mining.selectedResource}"]`);
  if (selectedRadio) {
    selectedRadio.checked = true;
  }
  
  // Show/hide mining stats card
  const miningStatsCard = document.getElementById('miningStatsCard');
  if (miningStatsCard) {
    miningStatsCard.style.display = S.activities.mining ? 'block' : 'none';
  }
  
  // Update mining stats
  if (S.activities.mining) {
    setText('resourcesGained', S.mining.resourcesGained || 0);
    
    const physiqueBonus = Math.floor((S.stats.physique - 10) * 2);
    setText('physiqueYieldBonus', `+${physiqueBonus}%`);
    
    const baseRate = getMiningRate(S.mining.selectedResource);
    const bonusRate = baseRate * (physiqueBonus / 100);
    const totalRate = baseRate + bonusRate;
    setText('currentMiningRate', `${totalRate.toFixed(1)}/sec`);
  }
  
  // Update resource rate displays
  updateMiningRateDisplays();
}

function getMiningRate(resource) {
  const baseRates = {
    stones: 3,
    iron: 1.5,
    ice: 0.75
  };
  
  const levelBonus = S.mining.level * 0.1;
  return (baseRates[resource] || 1) * (1 + levelBonus);
}

function updateMiningRateDisplays() {
  const physiqueBonus = Math.floor((S.stats.physique - 10) * 2);
  
  const stonesRate = getMiningRate('stones') * (1 + physiqueBonus / 100);
  const ironRate = getMiningRate('iron') * (1 + physiqueBonus / 100);
  const iceRate = getMiningRate('ice') * (1 + physiqueBonus / 100);
  
  setText('stonesRate', `+${stonesRate.toFixed(1)}/sec`);
  setText('ironRate', `+${ironRate.toFixed(1)}/sec`);
  setText('iceRate', `+${iceRate.toFixed(1)}/sec`);
}


function updateActivityCooking() {
  // Initialize cooking data if not exists
  if (!S.cooking) {
    S.cooking = {
      level: 1,
      exp: 0,
      expMax: 100
    };
  }
  
  // Initialize food slots if not exists
  if (!S.foodSlots) {
    S.foodSlots = {
      slot1: null,
      slot2: null,
      slot3: null,
      lastUsed: 0,
      cooldown: 5000
    };
  }
  
  // Initialize meat if not exists
  if (S.meat === undefined) S.meat = 0;
  if (S.cookedMeat === undefined) S.cookedMeat = 0;
  
  // Update cooking skill display
  setText('cookingLevel', S.cooking.level);
  setText('cookingExp', S.cooking.exp);
  setText('cookingExpMax', S.cooking.expMax);
  
  const yieldBonus = (S.cooking.level - 1) * 10;
  setText('cookingYieldBonus', yieldBonus + '%');
  setText('currentYieldBonus', yieldBonus);
  
  // Update progress bar
  const progressFill = document.getElementById('cookingProgressFill');
  if (progressFill) {
    progressFill.style.width = (S.cooking.exp / S.cooking.expMax * 100) + '%';
  }
  
  // Update cook button
  const cookButton = document.getElementById('cookMeatButton');
  if (cookButton) {
    cookButton.disabled = (S.meat || 0) === 0;
  }
  
  // Update food slots
  updateFoodSlots();
}

// Food System Functions
function cookMeat() {
  const amount = parseInt(document.getElementById('cookAmount').value) || 1;
  
  if ((S.meat || 0) < amount) {
    log('Not enough raw meat!', 'bad');
    return;
  }
  
  // Calculate yield with cooking bonus
  const yieldBonus = (S.cooking.level - 1) * 0.1; // 10% per level
  let cookedAmount = amount;
  
  // Apply yield bonus (chance for extra cooked meat)
  for (let i = 0; i < amount; i++) {
    if (Math.random() < yieldBonus) {
      cookedAmount++;
    }
  }
  
  // Consume raw meat and produce cooked meat
  S.meat -= amount;
  S.cookedMeat = (S.cookedMeat || 0) + cookedAmount;
  
  // Add cooking experience
  const expGain = amount * 10; // 10 exp per meat cooked
  S.cooking.exp += expGain;
  
  // Check for level up
  while (S.cooking.exp >= S.cooking.expMax) {
    S.cooking.exp -= S.cooking.expMax;
    S.cooking.level++;
    S.cooking.expMax = Math.floor(S.cooking.expMax * 1.2); // 20% increase per level
    log(`Cooking level increased to ${S.cooking.level}!`, 'good');
  }
  
  const bonusText = cookedAmount > amount ? ` (+${cookedAmount - amount} bonus)` : '';
  log(`Cooked ${amount} meat into ${cookedAmount} cooked meat${bonusText}!`, 'good');
  
  updateAll();
}

function equipFood(foodType, slotNumber) {
  if (!S.foodSlots) {
    S.foodSlots = {
      slot1: null,
      slot2: null,
      slot3: null,
      lastUsed: 0,
      cooldown: 5000
    };
  }
  
  const slotKey = `slot${slotNumber}`;
  
  // Check if we have the food
  if (foodType === 'meat' && (S.meat || 0) === 0) {
    log('No raw meat to equip!', 'bad');
    return;
  }
  if (foodType === 'cookedMeat' && (S.cookedMeat || 0) === 0) {
    log('No cooked meat to equip!', 'bad');
    return;
  }
  
  // Equip the food
  S.foodSlots[slotKey] = foodType;
  
  log(`Equipped ${foodType === 'meat' ? 'raw meat' : 'cooked meat'} to slot ${slotNumber}!`, 'good');
  updateAll();
}

function useFoodSlot(slotNumber) {
  if (!S.foodSlots) return;
  
  const slotKey = `slot${slotNumber}`;
  const foodType = S.foodSlots[slotKey];
  
  if (!foodType) {
    log('No food equipped in this slot!', 'bad');
    return;
  }
  
  // Check cooldown
  const now = Date.now();
  if (now - S.foodSlots.lastUsed < S.foodSlots.cooldown) {
    const remaining = Math.ceil((S.foodSlots.cooldown - (now - S.foodSlots.lastUsed)) / 1000);
    log(`Food is on cooldown! ${remaining}s remaining.`, 'bad');
    return;
  }
  
  // Check if we have the food
  if (foodType === 'meat' && (S.meat || 0) === 0) {
    log('No raw meat available!', 'bad');
    return;
  }
  if (foodType === 'cookedMeat' && (S.cookedMeat || 0) === 0) {
    log('No cooked meat available!', 'bad');
    return;
  }
  
  // Check if HP is full
  if (S.hp >= S.hpMax) {
    log('HP is already full!', 'bad');
    return;
  }
  
  // Consume food and restore HP
  let healAmount = 0;
  if (foodType === 'meat') {
    S.meat--;
    healAmount = 20;
  } else if (foodType === 'cookedMeat') {
    S.cookedMeat--;
    healAmount = 40;
  }
  
  const oldHP = S.hp;
  S.hp = Math.min(S.hpMax, S.hp + healAmount);
  const actualHeal = S.hp - oldHP;
  
  S.foodSlots.lastUsed = now;
  
  log(`Used ${foodType === 'meat' ? 'raw meat' : 'cooked meat'} and restored ${actualHeal} HP!`, 'good');
  
  // Update adventure HP if in combat
  if (S.adventure && S.adventure.inCombat) {
    S.adventure.playerHP = S.hp;
  }
  
  updateAll();
}





// Update sidebar activity displays
function updateSidebarActivities() {
  // Update cultivation
  setText('cultivationLevel', `${getRealmName(S.realm.tier)} ${S.realm.stage}`);
  const cultivationFill = document.getElementById('cultivationProgressFill');
  if (cultivationFill) {
    const foundationProgress = S.foundation / fCap();
    const progressPct = Math.floor(foundationProgress * 100);
    cultivationFill.style.width = progressPct + '%';
    setText('cultivationProgressText', progressPct + '%');
  }
  
  // Update physique
  if (S.physique) {
    setText('physiqueLevel', `Level ${S.physique.level}`);
    const physiqueFill = document.getElementById('physiqueProgressFill');
    if (physiqueFill) {
      const progressPct = Math.floor(S.physique.exp / S.physique.expMax * 100);
      physiqueFill.style.width = progressPct + '%';
      setText('physiqueProgressText', progressPct + '%');
    }
  }

  // Update mining
  if (S.mining) {
    setText('miningLevel', `Level ${S.mining.level}`);
    const miningFill = document.getElementById('miningProgressFill');
    if (miningFill) {
      const progressPct = Math.floor(S.mining.exp / S.mining.expMax * 100);
      miningFill.style.width = progressPct + '%';
      setText('miningProgressText', progressPct + '%');
    }
  }
  
  // Update adventure
  if (S.adventure) {
    const currentZone = ZONES[S.adventure.currentZone];
    setText('adventureLevel', currentZone ? currentZone.name : 'Zone 1');
    const adventureFill = document.getElementById('adventureProgressFill');
    if (adventureFill && currentZone) {
      const currentArea = currentZone.areas[S.adventure.currentArea];
      if (currentArea) {
        const progress = S.adventure.killsInCurrentArea / currentArea.killReq;
        const progressPct = Math.floor(progress * 100);
        adventureFill.style.width = progressPct + '%';
        setText('adventureProgressText', progressPct + '%');
      }
    }
  }
  
  // Update cooking (alchemy system)
  if (S.alchemy) {
    setText('cookingLevelSidebar', `Level ${S.alchemy.level}`);
    const cookingFill = document.getElementById('cookingProgressFillSidebar');
    if (cookingFill) {
      // Calculate alchemy experience progress (if xp and level system exists)
      const expRequired = S.alchemy.level * 100; // Basic progression formula
      const progressPct = S.alchemy.xp ? Math.floor((S.alchemy.xp % expRequired) / expRequired * 100) : 0;
      cookingFill.style.width = progressPct + '%';
      setText('cookingProgressTextSidebar', progressPct + '%');
    }
  }
  
  // Update sect status
  const buildingCount = Object.values(S.buildings).reduce((sum, level) => sum + (level > 0 ? 1 : 0), 0);
  setText('sectLevel', `${buildingCount} Buildings`);
  
  // Update sect status indicator
  const sectStatus = document.getElementById('sectStatus');
  if (sectStatus) {
    if (selectedActivity === 'sect') {
      sectStatus.textContent = 'Active';
      sectStatus.classList.add('active');
    } else {
      sectStatus.textContent = 'Inactive';
      sectStatus.classList.remove('active');
    }
  }
}

function updateActivitySect() {
  const buildingCount = Object.values(S.buildings).reduce((sum, level) => sum + (level > 0 ? 1 : 0), 0);
  setText('buildingCountActivity', buildingCount);
  setText('stonesActivity', Math.floor(S.stones));
  
  const goToSectBtn = document.getElementById('goToSectTab');
  if (goToSectBtn) {
    goToSectBtn.onclick = () => {
      if (typeof switchTab === 'function') {
        switchTab('sect');
      } else if (typeof showTab === 'function') {
        showTab('sect');
      } else {
        // Fallback: try to manually switch to sect tab
        selectActivity('sect');
        log('Switched to sect management', 'good');
      }
    };
  }
}

// Legacy function for compatibility
function updateActivityCards() {
  updateActivitySelectors();
  updateActivityContent();
}

function trainPhysique() {
  if (!S.activities.physique) {
    log('You must be training physique to use the training dummy!', 'bad');
    return;
  }
  
  // Simple mini-game: gain exp based on timing/clicking
  const baseExp = 5 + Math.floor(Math.random() * 10);
  const expGain = Math.floor(baseExp * (1 + (S.stats.physique - 10) * 0.1));
  
  S.physique.exp += expGain;
  
  // Level up check
  if (S.physique.exp >= S.physique.expMax) {
    S.physique.level++;
    S.physique.exp = 0;
    S.physique.expMax = Math.floor(S.physique.expMax * 1.2);
    
    // Award physique stat points
    const statGain = 1 + Math.floor(S.physique.level / 5);
    S.stats.physique += statGain;
    
    log(`Physique training level up! Level ${S.physique.level}. Physique +${statGain}`, 'good');
  } else {
    log(`Training session complete! +${expGain} physique exp`, 'good');
  }
  
  updateAll();
}

// Mining is now passive - no manual mining function needed

// Session-based physique training functions
function updateTimingCursor() {
  if (!S.physique.timingActive || !S.physique.trainingSession) return;
  
  // Ensure cursorSpeed exists (for backward compatibility)
  if (!S.physique.cursorSpeed) S.physique.cursorSpeed = 5;
  
  // Move cursor back and forth across the timing bar (accelerating movement)
  S.physique.cursorPosition += S.physique.cursorDirection * S.physique.cursorSpeed;
  
  if (S.physique.cursorPosition >= 100) {
    S.physique.cursorPosition = 100;
    S.physique.cursorDirection = -1;
  } else if (S.physique.cursorPosition <= 0) {
    S.physique.cursorPosition = 0;
    S.physique.cursorDirection = 1;
  }
  
  const cursor = document.getElementById('timingCursor');
  if (cursor) {
    cursor.style.left = S.physique.cursorPosition + '%';
  }
}

function startTrainingSession() {
  if (!S.physique || S.physique.stamina < 20) return;
  
  // Start the training session
  S.physique.trainingSession = true;
  S.physique.timingActive = true;
  S.physique.sessionStamina = S.physique.stamina;
  S.physique.sessionHits = 0;
  S.physique.sessionXP = 0;
  S.physique.cursorPosition = 0;
  S.physique.cursorDirection = 1;
  S.physique.cursorSpeed = 7; // Start with faster base speed
  
  log('Training session started! Hit the perfect zone for maximum XP!', 'good');
  updateAll();
}

function executeHit() {
  if (!S.physique || !S.physique.trainingSession || !S.physique.timingActive) return;
  
  // Calculate hit quality based on cursor position
  const perfectZoneStart = 45;
  const perfectZoneEnd = 55;
  const goodZoneStart = 35;
  const goodZoneEnd = 65;
  
  let hitQuality = 'poor';
  let xpGain = 3 + Math.random() * 2; // 3-5 XP
  let hitMessage = 'Poor timing!';
  let hitColor = '#dc2626'; // Red
  
  if (S.physique.cursorPosition >= perfectZoneStart && S.physique.cursorPosition <= perfectZoneEnd) {
    hitQuality = 'perfect';
    xpGain = 15 + Math.random() * 10; // 15-25 XP
    hitMessage = 'PERFECT!';
    hitColor = '#22c55e'; // Green
    S.physique.perfectHits++;
    S.physique.hitStreak++;
  } else if (S.physique.cursorPosition >= goodZoneStart && S.physique.cursorPosition <= goodZoneEnd) {
    hitQuality = 'good';
    xpGain = 8 + Math.random() * 4; // 8-12 XP
    hitMessage = 'Good!';
    hitColor = '#f59e0b'; // Yellow
    S.physique.hitStreak = Math.max(0, S.physique.hitStreak - 1);
  } else {
    S.physique.hitStreak = 0;
  }
  
  // Apply streak bonus
  const streakBonus = Math.min(S.physique.hitStreak * 0.05, 0.5); // Max 50% bonus
  xpGain *= (1 + streakBonus);
  
  // Add to session stats
  S.physique.sessionHits++;
  S.physique.sessionXP += xpGain;
  S.physique.exp += xpGain;
  
  // Accelerate cursor with each hit (makes it progressively harder)
  S.physique.cursorSpeed += 1.5; // Increase speed by 1.5 per hit
  const maxSpeed = 25; // Cap maximum speed to keep it playable
  S.physique.cursorSpeed = Math.min(S.physique.cursorSpeed, maxSpeed);
  
  // Show hit feedback
  showHitFeedback(hitMessage, hitColor);
  
  updateAll();
}

function showHitFeedback(message, color) {
  // Create temporary feedback element
  const hitButton = document.getElementById('hitButton');
  if (hitButton) {
    const originalText = hitButton.textContent;
    const originalColor = hitButton.style.backgroundColor;
    
    hitButton.textContent = message;
    hitButton.style.backgroundColor = color;
    hitButton.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
      hitButton.textContent = originalText;
      hitButton.style.backgroundColor = originalColor;
      hitButton.style.transform = 'scale(1)';
    }, 300);
  }
}

function endTrainingSession() {
  if (!S.physique || !S.physique.trainingSession) return;
  
  S.physique.trainingSession = false;
  S.physique.timingActive = false;
  
  const totalXP = Math.floor(S.physique.sessionXP);
  const hits = S.physique.sessionHits;
  
  log(`Training session complete! ${hits} hits, +${totalXP} total XP gained!`, 'good');
  
  // Reset session stats
  S.physique.sessionStamina = 0;
  S.physique.sessionHits = 0;
  S.physique.sessionXP = 0;
  
  updateAll();
}

function updateActivityUI() {
  // Update activity status displays
  const activities = ['cultivation', 'physique', 'adventure', 'mining', 'cooking'];

  activities.forEach(activity => {
    const statusEl = document.getElementById(`${activity}Status`);
    const btnEl = document.getElementById(`start${activity.charAt(0).toUpperCase() + activity.slice(1)}`);
    const panelEl = document.getElementById(`${activity}Panel`);

    if (statusEl && btnEl && panelEl) {
      if (S.activities[activity]) {
        statusEl.textContent = 'Active';
        statusEl.style.background = 'rgba(34, 197, 94, 0.2)';
        statusEl.style.color = '#22c55e';
        btnEl.textContent = btnEl.textContent.replace('Start', 'Stop');
        btnEl.classList.add('active');
        panelEl.classList.add('active');
      } else {
        statusEl.textContent = 'Inactive';
        statusEl.style.background = 'rgba(107, 114, 128, 0.2)';
        statusEl.style.color = '#9ca3af';
        btnEl.classList.remove('active');
        panelEl.classList.remove('active');

        // Reset button text
        if (activity === 'cultivation') btnEl.textContent = 'Start Cultivating';
        if (activity === 'physique') btnEl.textContent = '💪 Train Physique';
        if (activity === 'adventure') btnEl.textContent = '🗺️ Explore';
        if (activity === 'mining') btnEl.textContent = '⛏️ Mine Ore';
      }
    }
  });
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

// Law System Functions
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
          } else if (effect !== 'desc' && Object.prototype.hasOwnProperty.call(S.buildingBonuses, effect)) {
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
  const base = {herbs:1, ore:0.7, wood:0.5};
  
  // Ensure stats exist
  if (!S.stats) {
    S.stats = {
      physique: 10, mind: 10, dexterity: 10, comprehension: 10,
      criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
    };
  }
  
  // Physique affects mining (ore) yield (3% per point above 10)
  let physiqueMult = 1;
  if (type === 'ore') {
    physiqueMult = 1 + (S.stats.physique - 10) * 0.03;
  }
  
  return base[type] * (1 + S.yieldMult[type]) * physiqueMult;
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
  const r=RECIPES[q.key]; 
  
  // Ensure stats exist
  if (!S.stats) {
    S.stats = {
      physique: 10, mind: 10, dexterity: 10, comprehension: 10,
      criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
    };
  }
  
  // Mind affects alchemy success (4% per point above 10)
  const mindBonus = (S.stats.mind - 10) * 0.04;
  const chance = r.base + S.alchemy.successBonus + mindBonus;
  
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
  const { enemyHP, enemyMax, atk, def } = initializeFight(b);
  const h = {i, name:b.name, base:b, enemyMax, enemyHP, eAtk:atk, eDef:def, regen:0, affixes:[]};
  applyRandomAffixes(h);
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
  S.combat.hunt.enemyHP = processAttack(S.combat.hunt.enemyHP, dmg);
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
  S.qi -= need; const dmg = need/3 + calcAtk(); S.combat.hunt.enemyHP = processAttack(S.combat.hunt.enemyHP, dmg); S.combat.cds.burst = 15; log('Qi Burst detonates!','good'); updateHuntUI();
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
const ascendBtn = document.getElementById('ascendBtn');
if (ascendBtn) {
  ascendBtn.addEventListener('click', ()=>{
    const gain = calcKarmaGain();
    if(!confirm(`Ascend now and earn ${gain} karma? This resets most progress.`)) return;
    S.karmaPts += gain; S.ascensions++;
    const keep = {karmaPts:S.karmaPts, ascensions:S.ascensions, karma:S.karma};
    setState(Object.assign(defaultState(), keep));
    save(); location.reload();
  });
}


/* Loop */
function tick(){
  S.time++;

  // Passive Qi regen and out-of-combat HP regen
  S.qi = clamp(S.qi + qiRegenPerSec(), 0, qCap());
  if (!(S.adventure?.inCombat) && !S.combat.hunt) {
    S.hp = clamp(S.hp + 1, 0, S.hpMax);
    if (S.adventure) S.adventure.playerHP = S.hp;
  }

  // Gathering
  S.herbs += yieldBase('herbs') * S.gather.herbs;
  S.ore   += yieldBase('ore')   * S.gather.ore;
  S.wood  += yieldBase('wood')  * S.gather.wood;

  // Alchemy
  S.alchemy.queue.forEach(q=>{ if(!q.done){ q.t -= 1; if(q.t<=0){ q.t=0; q.done=true; } }});

  // Activity-based progression
  if(S.activities.cultivation) {
    const gain = foundationGainPerSec();
    S.foundation = clamp(S.foundation + gain, 0, fCap());
  }
  
  // Passive mining progression
  if(S.activities.mining && S.mining && S.mining.selectedResource) {
    const baseRate = getMiningRate(S.mining.selectedResource);
    const physiqueBonus = Math.floor((S.stats.physique - 10) * 2);
    const totalRate = baseRate * (1 + physiqueBonus / 100);
    
    // Add resources based on selected type
    switch(S.mining.selectedResource) {
      case 'stones':
        S.stones += totalRate;
        break;
      case 'iron':
        if (!S.iron) S.iron = 0;
        S.iron += totalRate;
        break;
      case 'ice':
        if (!S.ice) S.ice = 0;
        S.ice += totalRate;
        break;
    }
    
    // Track resources gained for display
    if (!S.mining.resourcesGained) S.mining.resourcesGained = 0;
    S.mining.resourcesGained += totalRate;
    
    // Mining experience gain (slower than active training)
    const expGain = 0.5; // 0.5 exp per second
    S.mining.exp += expGain;
    
    // Level up check
    if (S.mining.exp >= S.mining.expMax) {
      S.mining.level++;
      S.mining.exp = 0;
      S.mining.expMax = Math.floor(S.mining.expMax * 1.3);
      log(`Mining level up! Level ${S.mining.level}`, 'good');
    }
  }
  
  // Physique training progression
  if(S.activities.physique && S.physique) {
    // Training session stamina drain
    if (S.physique.trainingSession) {
      S.physique.sessionStamina -= 6; // 6 stamina per second during session (3x increase)
      S.physique.stamina -= 6;
      
      // End session when stamina is depleted
      if (S.physique.sessionStamina <= 0 || S.physique.stamina <= 0) {
        endTrainingSession();
      }
      
      // Update timing cursor during session
      if (S.physique.timingActive) {
        updateTimingCursor();
      }
    } else {
      // Stamina regeneration when not in session (1 stamina per second)
      if (S.physique.stamina < S.physique.maxStamina) {
        S.physique.stamina = Math.min(S.physique.stamina + 1, S.physique.maxStamina);
      }
    }
    
    // Passive training XP gain (slower than active sessions, reduced to 1/3)
    if (!S.physique.trainingSession) {
      const passiveRate = (2 + (S.physique.level * 0.2)) / 3;
      S.physique.exp += passiveRate;
      S.physique.passiveXpGained += passiveRate;
    }
    
    // Level up check
    if (S.physique.exp >= S.physique.expMax) {
      S.physique.level++;
      S.physique.exp = 0;
      S.physique.expMax = Math.floor(S.physique.expMax * 1.4);
      S.physique.maxStamina += 10; // Increase max stamina with level
      S.stats.physique += 1; // Increase physique stat
      log(`Physique level up! Level ${S.physique.level} (+1 Physique)`, 'good');
    }
  }
  
  // Auto meditation fallback for old saves
  if(S.auto.meditate && !S.activities.cultivation) {
    const gain = foundationGainPerSec() * 0.5; // Reduced when not actively cultivating
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
    h.enemyHP = processAttack(h.enemyHP, ourDPS);
    if(h.regen) h.enemyHP += h.enemyMax * h.regen;
    h.enemyHP = clamp(h.enemyHP, 0, h.enemyMax);
    S.hp = processAttack(S.hp, enemyDPS);
    if(h.enemyHP<=0){ resolveHunt(true); }
    else if(S.hp<=1){ resolveHunt(false); }
    updateHuntUI();
  }

  // CDs
  for(const k in S.combat.cds){ if(S.combat.cds[k]>0) S.combat.cds[k]--; }

  // Breakthrough progress
  updateBreakthrough();

  // Adventure combat
  if(S.activities.adventure && S.adventure && S.adventure.inCombat) {
    updateAdventureCombat();
  }

  if(S.time % 2===0) updateWinEst();
  updateSidebarActivities(); // Update progress bars every tick
  updateAll();
}



// Activity selector event listeners
function initActivityListeners() {
  // New compact sidebar activity listeners
  const activityItems = document.querySelectorAll('.activity-item[data-activity]');
  activityItems.forEach(item => {
    item.addEventListener('click', () => {
      const activityType = item.dataset.activity;
      selectActivity(activityType);
    });
  });
  
  // Legacy selectors (if they exist)
  document.getElementById('cultivationSelector')?.addEventListener('click', () => selectActivity('cultivation'));
  document.getElementById('physiqueSelector')?.addEventListener('click', () => selectActivity('physique'));
  document.getElementById('miningSelector')?.addEventListener('click', () => selectActivity('mining'));
  document.getElementById('adventureSelector')?.addEventListener('click', () => selectActivity('adventure'));
  document.getElementById('sectSelector')?.addEventListener('click', () => selectActivity('sect'));
  
  // Activity content event listeners
  document.getElementById('useQiPillActivity')?.addEventListener('click', () => usePill('qi'));
  document.getElementById('useWardPillActivity')?.addEventListener('click', () => usePill('ward'));
  
  // Session-based training event listeners
  document.getElementById('startTrainingSession')?.addEventListener('click', startTrainingSession);
  document.getElementById('hitButton')?.addEventListener('click', executeHit);
  
  // Mining resource selection event listeners
  const miningResourceInputs = document.querySelectorAll('input[name="miningResource"]');
  miningResourceInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if (S.mining) {
        S.mining.selectedResource = e.target.value;
        S.mining.resourcesGained = 0; // Reset counter when switching resources
        log(`Switched mining to ${e.target.value === 'stones' ? 'Spirit Stones' : e.target.value === 'iron' ? 'Iron Ore' : 'Ice Crystal'}`, 'good');
        updateActivityMining();
      }
    });
  });
  
  // Adventure Map button event listener - MAP-UI-UPDATE
  document.getElementById('mapButton')?.addEventListener('click', () => {
    import('../src/game/adventure.js').then(({ showMapOverlay }) => {
      showMapOverlay();
    });
  });

  function startRetreatCountdown() {
    const btn = document.getElementById('startBattleButton');
    if (!S.adventure || !S.adventure.inCombat || !btn) return;
    let remaining = 5;
    btn.disabled = true;
    btn.textContent = `Retreating (${remaining})`;
    const interval = setInterval(() => {
      if (S.adventure.playerHP <= 0) {
        clearInterval(interval);
        btn.disabled = false;
        btn.classList.remove('warn');
        btn.classList.add('primary');
        btn.textContent = '⚔️ Start Battle';
        if (typeof globalThis.stopActivity === 'function') {
          globalThis.stopActivity('adventure');
        } else {
          S.activities.adventure = false;
        }
        S.qi = 0;
        updateActivityAdventure();
        return;
      }
      remaining--;
      if (remaining > 0) {
        btn.textContent = `Retreating (${remaining})`;
      } else {
        clearInterval(interval);
        retreatFromCombat();
        if (typeof globalThis.stopActivity === 'function') {
          globalThis.stopActivity('adventure');
        } else {
          S.activities.adventure = false;
        }
        const loss = Math.floor(qCap() * 0.25);
        S.qi = Math.max(0, S.qi - loss);
        log(`Retreated from combat. Lost ${loss} Qi.`, 'neutral');
        btn.disabled = false;
        btn.classList.remove('warn');
        btn.classList.add('primary');
        btn.textContent = '⚔️ Start Battle';
        updateActivityAdventure();
      }
    }, 1000);
  }

  // Adventure start battle / retreat button event listener
  const startBtn = document.getElementById('startBattleButton');
  startBtn?.addEventListener('click', () => {
    if (S.adventure && S.adventure.inCombat) {
      startRetreatCountdown();
      return;
    }

    // Ensure adventure data is initialized
    if (!S.adventure) {
      const { enemyHP, enemyMax } = initializeFight({ hp: 0 });
      S.adventure = {
        currentZone: 0,
        currentArea: 0,
        selectedZone: 0,
        selectedArea: 0,
        totalKills: 0,
        areasCompleted: 0,
        zonesUnlocked: 1,
        killsInCurrentArea: 0,
        inCombat: false,
        playerHP: S.hp,
        enemyHP,
        enemyMaxHP: enemyMax,
        currentEnemy: null,
        lastPlayerAttack: 0,
        lastEnemyAttack: 0,
        combatLog: []
      };
    }

    // Start the adventure activity if not already active
    if (!S.activities.adventure) {
      startActivity('adventure');
    }

    // Start combat immediately
    startAdventureCombat();
    updateActivityAdventure();
    startBtn.textContent = '🏃 Retreat';
    startBtn.classList.remove('primary');
    startBtn.classList.add('warn');
  });

  // Adventure progress button event listener
  document.getElementById('progressButton')?.addEventListener('click', () => {
    progressToNextArea();
  });
  
  // Adventure boss challenge button event listener
  document.getElementById('challengeBossButton')?.addEventListener('click', () => {
    // Ensure adventure data is initialized
    if (!S.adventure) {
      const { enemyHP, enemyMax } = initializeFight({ hp: 0 });
      S.adventure = {
        currentZone: 0,
        currentArea: 0,
        selectedZone: 0,
        selectedArea: 0,
        totalKills: 0,
        areasCompleted: 0,
        zonesUnlocked: 1,
        killsInCurrentArea: 0,
        inCombat: false,
        playerHP: S.hp,
        enemyHP,
        enemyMaxHP: enemyMax,
        currentEnemy: null,
        lastPlayerAttack: 0,
        lastEnemyAttack: 0,
        combatLog: []
      };
    }
    
    // Start the adventure activity if not already active
    if (!S.activities.adventure) {
      startActivity('adventure');
    }
    
    // Start boss combat
    startBossCombat();
    updateActivityAdventure();
  });

  document.getElementById('claimLootBtn')?.addEventListener('click', () => {
    retreatFromCombat();
    renderCharacterPanel();
  });
  document.getElementById('forfeitLootBtn')?.addEventListener('click', () => {
    if (confirm('Forfeit all loot?')) {
      forfeitSessionLoot();
      updateLootTab();
    }
  });
}

// Add physique training dummy interaction
function addPhysiqueMinigame() {
  // Add training dummy button to physique tab when it's implemented
  // For now, we'll add a simple training button to the cultivation tab
  const cultivationTab = document.getElementById('tab-cultivation');
  if (cultivationTab && !document.getElementById('trainDummyBtn')) {
    const trainingSection = document.createElement('div');
    trainingSection.innerHTML = `
      <div class="card" id="physiqueTrainingCard" style="display:none;">
        <h4>💪 Physique Training</h4>
        <p class="muted">Train with the training dummy to increase your physical power. Click rapidly to maximize your training effectiveness!</p>
        <div class="stat"><span>Training Level</span><span id="trainingLevel">1</span></div>
        <div class="progress-wrap" style="margin:10px 0">
          <span class="badge">Progress</span>
          <div class="bar" style="flex:1"><div class="fill" id="trainingFill"></div></div>
          <span id="trainingPct">0%</span>
        </div>
        <button class="btn primary" id="trainDummyBtn">🥊 Train with Dummy</button>
        <div class="muted" style="margin-top:8px">Requires: Physique Training activity active</div>
      </div>
    `;
    cultivationTab.appendChild(trainingSection);
    
    document.getElementById('trainDummyBtn').addEventListener('click', trainPhysique);
  }
}

// Mining actions are now handled in the activity panel - no separate function needed



// Init
window.addEventListener('load', ()=>{
  initUI();
  initLawSystem();
  initActivityListeners();
  setupAdventureTabs();
  setupCharacterTab(); // EQUIP-CHAR-UI
  selectActivity('cultivation'); // Start with cultivation selected
  updateAll();
  tick();
  log('Welcome, cultivator.');
  setInterval(tick, 1000);
});

// CHANGELOG: Added weapon HUD integration.