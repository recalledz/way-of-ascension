/* eslint-disable no-unused-vars */
/* global updateYinYangVisual, updateBreathingStats, updateLotusFoundationFill, showActivity, switchTab, showTab */

// Way of Ascension — Modular JS

import { LAWS } from '../src/features/progression/data/laws.js';
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
  calculatePlayerCombatAttack,
  calculatePlayerAttackRate
} from '../src/features/progression/selectors.js';
import { initializeFight } from '../src/features/combat/mutators.js';
import { refillShieldFromQi } from '../src/features/combat/logic.js';
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
import { initializeWeaponChip, updateWeaponChip } from '../src/features/inventory/ui/weaponChip.js';
import {
  updateActivityAdventure,
  updateAdventureCombat,
  updateFoodSlots,
  setupAdventureTabs,
  updateAbilityBar
} from '../src/features/adventure/logic.js';
import {
  startAdventureCombat,
  startBossCombat,
  progressToNextArea,
  retreatFromCombat,
  instakillCurrentEnemy
} from '../src/features/adventure/mutators.js';
import { updateWeaponProficiencyDisplay } from '../src/features/proficiency/ui/weaponProficiencyDisplay.js';
import { setupLootUI } from '../src/features/loot/ui/lootTab.js';
import { renderEquipmentPanel, setupEquipmentTab } from '../src/features/inventory/ui/CharacterPanel.js'; // EQUIP-CHAR-UI
import { ZONES } from '../src/features/adventure/data/zones.js'; // MAP-UI-UPDATE
import { setReduceMotion } from '../src/ui/fx/fx.js';
import { tickAbilityCooldowns } from '../src/features/ability/mutators.js';

// Global variables
const progressBars = {};
let selectedActivity = 'cultivation'; // Current selected activity for the sidebar






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
import { ENEMY_DATA } from '../src/features/adventure/data/enemies.js';

// Adventure System Data
// Enemy data for adventure zones

function updateQiOrbEffect(){
  const qiOrb = document.getElementById('qiOrb');
  if(!qiOrb) return;
  
  // Check if foundation is at maximum capacity
  const isFoundationMax = S.foundation >= fCap(S) * 0.99; // 99% or higher counts as "max"
  
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

  // Assign buttons
  // Buttons (with safe null checks)
  const meditateBtn = qs('#meditateBtn');
  if (meditateBtn) meditateBtn.addEventListener('click', meditate);
  initRealmUI();
  
  
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
  
  
  const autoAdventure = qs('#autoAdventure');
  if (autoAdventure) {
    autoAdventure.checked = S.auto.adventure;
    autoAdventure.addEventListener('change', e => S.auto.adventure = e.target.checked);
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


  // Safe render calls
  renderKarma();
  updateAll();
}

function updateAll(){
  updateRealmUI();

  // Qi
  setText('qiVal', fmt(S.qi)); setText('qiCap', fmt(qCap(S)));
  setText('qiValL', fmt(S.qi)); setText('qiCapL', fmt(qCap(S)));
  setText('qiRegen', qiRegenPerSec(S).toFixed(1));
  setFill('qiFill', S.qi / qCap(S));
  setFill('qiFill2', S.qi / qCap(S));
  setText('qiPct', Math.floor(100 * S.qi / qCap(S)) + '%');
  
  // Foundation
  setFill('cultivationProgressFill', S.foundation / fCap(S));
  setText('cultivationProgressText', `${fmt(S.foundation)} / ${fmt(fCap(S))}`);
  setText('foundValL', fmt(S.foundation)); setText('foundCapL', fmt(fCap(S)));
  setFill('foundFill', S.foundation / fCap(S));
  setFill('foundFill2', S.foundation / fCap(S));
  setText('foundPct', Math.floor(100 * S.foundation / fCap(S)) + '%');
  
  // HP
  setText('hpVal', fmt(S.hp)); setText('hpMax', fmt(S.hpMax));
  setText('hpValL', fmt(S.hp)); setText('hpMaxL', fmt(S.hpMax));
  setFill('hpFill', S.hp / S.hpMax);
  setFill('shieldFill', S.shield?.max ? S.shield.current / S.shield.max : 0);
  
  // Combat stats
  setText('atkVal', calcAtk(S)); setText('defVal', calcDef(S));
  setText('armorVal', S.stats?.armor || 0);
  setText('accuracyVal', S.stats?.accuracy || 0);
  setText('dodgeVal', S.stats?.dodge || 0);
  setText('atkVal2', calcAtk(S)); setText('defVal2', calcDef(S));
  setText('armorVal2', S.stats?.armor || 0);
  setText('accuracyVal2', S.stats?.accuracy || 0);
  setText('dodgeVal2', S.stats?.dodge || 0);
  
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
  setText('stonesDisplay', fmt(S.stones));
  
  // Safe call to updateActivityUI if it exists
  if (typeof updateActivityUI === 'function') updateActivityUI();
  
  // Resources
  setText('stonesVal', fmt(S.stones)); setText('stonesValL', fmt(S.stones));
  setText('herbVal', fmt(S.herbs)); setText('oreVal', fmt(S.ore)); setText('woodVal', fmt(S.wood)); setText('coreVal', fmt(S.cores));
  setText('pillQi', S.pills.qi); setText('pillBody', S.pills.body); setText('pillWard', S.pills.ward);
  
  // Disciples
  
  // Karma
  setText('karmaVal', S.karmaPts);
  const ascendBtn = document.getElementById('ascendBtn');
  if (ascendBtn) ascendBtn.disabled = calcKarmaGain() <= 0;
  
  // Laws
  if (typeof updateLawsDisplay === 'function') updateLawsDisplay();
  
  // Safe render function calls
  renderKarma(); 
  if (typeof updateQiOrbEffect === 'function') updateQiOrbEffect();
  if (typeof updateYinYangVisual === 'function') updateYinYangVisual();
  if (typeof updateBreathingStats === 'function') updateBreathingStats();
  if (typeof updateLotusFoundationFill === 'function') updateLotusFoundationFill();
  updateActivityCards();
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
    const foundationPct = S.foundation / fCap(S) * 100;
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
  if (sectSelector) {
    sectSelector.classList.toggle('active', selectedActivity === 'sect');
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
      renderEquipmentPanel(); // EQUIP-CHAR-UI
      break;
    case 'cooking':
      updateActivityCooking();
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
    const hpBonus = Math.floor((currentPhysique - 10) * 5);
    const carryCapacity = Math.max(0, currentPhysique - 10);

    setText('currentPhysiqueStat', currentPhysique);
    setText('physiqueHpStat', `+${Math.max(0, hpBonus)}`);
    setText('physiqueCarryStat', `+${carryCapacity}`);
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
    const baseRate = getMiningRate(S.mining.selectedResource);
    setText('currentMiningRate', `${baseRate.toFixed(1)}/sec`);
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
  const stonesRate = getMiningRate('stones');
  const ironRate = getMiningRate('iron');
  const iceRate = getMiningRate('ice');

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
    const foundationProgress = S.foundation / fCap(S);
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
  
  // Check for any laws that should already be unlocked
  checkLawUnlocks();
}

function meditate(){
  const gain = foundationGainPerMeditate(S);
  S.foundation = clamp(S.foundation + gain, 0, fCap(S));
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


// Upgrades
function canPay(cost){ return Object.entries(cost).every(([k,v])=> (S[k]||0) >= v); }
function pay(cost){ if(!canPay(cost)) return false; Object.entries(cost).forEach(([k,v])=> S[k]-=v); return true; }
function buy(u){ if(S.bought[u.key]) return false; if(!pay(u.cost)) { log('Not enough resources','bad'); return false; } u.apply(S); S.bought[u.key]=true; log(`Bought ${u.name}`,'good'); return true; }

// Pills
function usePill(type){
  if(S.pills[type]<=0){ log('No pill available','bad'); return; }
  if(type==='qi'){ const add = Math.floor(qCap(S)*0.25); S.qi=clamp(S.qi+add,0,qCap(S)); }
  if(type==='body'){ S.tempAtk+=4; S.tempDef+=3; setTimeout(()=>{ S.tempAtk=Math.max(0,S.tempAtk-4); S.tempDef=Math.max(0,S.tempDef-3); updateAll(); }, 60000); }
  if(type==='ward'){ /* consumed during breakthrough */ }
  S.pills[type]--; updateAll();
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
  tickAbilityCooldowns(1000);

  // Passive Qi regen and out-of-combat HP regen
  S.qi = clamp(S.qi + qiRegenPerSec(S), 0, qCap(S));
  if (!(S.adventure?.inCombat)) {
    S.hp = clamp(S.hp + 1, 0, S.hpMax);
    if (S.adventure) S.adventure.playerHP = S.hp;
    const { gained, qiSpent } = refillShieldFromQi(S);
    if (gained > 0) log(`Your Qi reforms ${gained} shield (${qiSpent.toFixed(1)} Qi).`);
  }

  // Activity-based progression
  if(S.activities.cultivation) {
    const gain = foundationGainPerSec(S);
    S.foundation = clamp(S.foundation + gain, 0, fCap(S));
  }
  
  // Passive mining progression
  if(S.activities.mining && S.mining && S.mining.selectedResource) {
    const totalRate = getMiningRate(S.mining.selectedResource);
    
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
  if(S.auto.meditate && Object.values(S.activities).every(a => !a)) {
    const gain = foundationGainPerSec(S) * 0.5; // Reduced when not actively cultivating
    S.foundation = clamp(S.foundation + gain, 0, fCap(S));
  }
  if(S.auto.adventure && !S.activities.adventure){ startActivity('adventure'); }

  // CDs
  if (S.combat?.cds) {
    for(const k in S.combat.cds){ if(S.combat.cds[k]>0) S.combat.cds[k]--; }
  }

  // Breakthrough progress
  updateBreakthrough();

  // Adventure combat
  if(S.activities.adventure && S.adventure && S.adventure.inCombat) {
    updateAdventureCombat();
  }

  updateSidebarActivities(); // Update progress bars every tick
  updateAll();
  updateAbilityBar();
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
    import('../src/features/adventure/logic.js').then(({ showMapOverlay }) => {
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
        const loss = Math.floor(qCap(S) * 0.25);
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

  setupLootUI({ retreatFromCombat, renderEquipmentPanel });
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
  setupEquipmentTab(); // EQUIP-CHAR-UI
  selectActivity('cultivation'); // Start with cultivation selected
  updateAll();
  tick();
  log('Welcome, cultivator.');
  setInterval(tick, 1000);
});

// CHANGELOG: Added weapon HUD integration.