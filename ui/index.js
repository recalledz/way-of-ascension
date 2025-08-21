/* eslint-disable no-unused-vars */
/* global updateYinYangVisual, updateBreathingStats, updateLotusFoundationFill, showActivity, switchTab, showTab */

// Way of Ascension — Modular JS

import { LAWS } from '../src/features/progression/data/laws.js';
import { S, defaultState, save, setState } from '../src/shared/state.js';
import {
  clamp,
  qCap,
  qiRegenPerSec,
  fCap,
  foundationGainPerSec,
  foundationGainPerMeditate,
  powerMult,
  calculatePlayerCombatAttack,
  calculatePlayerAttackRate
} from '../src/features/progression/selectors.js';
import { initializeFight } from '../src/features/combat/mutators.js';
import { refillShieldFromQi } from '../src/features/combat/logic.js';
import {
  updateRealmUI,
  updateActivityCultivation,
  updateBreakthrough,
  initRealmUI,
  getRealmName,
  checkLawUnlocks,
} from '../src/features/progression/index.js';
import { qs, setText, setFill, log } from '../src/shared/utils/dom.js';
import { fmt } from '../src/shared/utils/number.js';
import { emit } from '../src/shared/events.js';
import { createProgressBar, updateProgressBar } from './components/progressBar.js';
import { renderSidebarActivities } from '../src/ui/sidebar.js';
import { initializeWeaponChip } from '../src/features/inventory/ui/weaponChip.js';
import { WEAPONS } from '../src/features/weaponGeneration/data/weapons.js';
import {
  updateActivityAdventure,
  updateAdventureCombat,
  setupAdventureTabs,
  updateAbilityBar
} from '../src/features/adventure/logic.js';
import { updateActivityCooking, updateCookingSidebar } from '../src/features/cooking/ui/cookingDisplay.js';
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
import { setReduceMotion } from '../src/features/combat/ui/index.js';
import { tickAbilityCooldowns } from '../src/features/ability/mutators.js';
import { advanceMining } from '../src/features/mining/logic.js';
import { mountAlchemyUI } from '../src/features/alchemy/ui/alchemyDisplay.js';
import { mountKarmaUI } from '../src/features/karma/ui/karmaDisplay.js';
import { updateQiAndFoundation } from '../src/features/progression/ui/qiDisplay.js';
import { updateCombatStats } from '../src/features/combat/ui/combatStats.js';
import { updateAdventureProgress } from '../src/features/adventure/ui/adventureDisplay.js';
import { updateResourceDisplay } from '../src/features/inventory/ui/resourceDisplay.js';
import { updateKarmaDisplay } from '../src/features/karma/ui/karmaHUD.js';
import { updateLawsUI } from '../src/features/progression/ui/lawsHUD.js';
import { calcKarmaGain } from '../src/features/karma/selectors.js';
import { tickPhysiqueTraining, endTrainingSession } from '../src/features/physique/mutators.js';
import { mountTrainingGameUI } from '../src/features/physique/ui/trainingGame.js';

// Global variables
const progressBars = {};
let selectedActivity = 'cultivation'; // Current selected activity for the sidebar






// Import enemy data from the enemies module
import { ENEMY_DATA } from '../src/features/adventure/data/enemies.js';

// Adventure System Data
// Enemy data for adventure zones

function initUI(){
  // Render sidebar activities
  renderSidebarActivities();

  const mh = S.equipment?.mainhand;
  const mhKey = typeof mh === 'string' ? mh : mh?.key || 'fist';
  const mhName = WEAPONS[mhKey]?.displayName || (mhKey === 'fist' ? 'Fists' : mhKey);
  initializeWeaponChip({ key: mhKey, name: mhName });
  mountTrainingGameUI(S);

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
    updateAll();
  }

function updateAll(){
  updateRealmUI();
  updateQiAndFoundation();

  // HP
  setText('hpVal', fmt(S.hp)); setText('hpMax', fmt(S.hpMax));
  setText('hpValL', fmt(S.hp)); setText('hpMaxL', fmt(S.hpMax));
  setFill('hpFill', S.hp / S.hpMax);
  setFill('shieldFill', S.shield?.max ? S.shield.current / S.shield.max : 0);
  updateCombatStats();
  
  // Activity system display
  if (!S.activities) {
    S.activities = { cultivation: false, physique: false, mining: false, adventure: false, cooking: false };
  }
  updateCurrentTaskDisplay();


  // Update progression displays
  setFill('physiqueProgressFill', S.physique.exp / S.physique.expMax);
  setText('physiqueProgressText', `${fmt(S.physique.exp)} / ${fmt(S.physique.expMax)} XP`);
  setText('physiqueLevel', `Level ${S.physique.level}`);

  updateCookingSidebar();

  updateAdventureProgress();
  
  // Safe call to updateActivityUI if it exists
  if (typeof updateActivityUI === 'function') updateActivityUI();
  
  updateResourceDisplay();

  // Disciples

  updateKarmaDisplay();
  updateLawsUI();
  updateActivityCards();

  emit('RENDER');
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
  
  if (activityName === 'mining') {
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
  if (activityName === 'physique') {
    const summary = endTrainingSession(S);
    if (summary) {
      log(`Training session complete! ${summary.hits} hits for ${summary.xp} XP`, 'good');
    }
  }
  if (activityName === 'cultivation' && S.auto) {
    // Ensure passive meditation doesn't continue when cultivation is stopped
    S.auto.meditate = false;
  }
  
  log(`Stopped ${activityName}`, 'neutral');
  updateActivitySelectors();
  updateActivityContent();
}

// Expose activity controls globally so other modules like the progression realm UI can access
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
  
  updateCookingSidebar();
  
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
const ascendBtn = document.getElementById('ascendBtn');
if (ascendBtn) {
  ascendBtn.addEventListener('click', ()=>{
    const gain = calcKarmaGain();
    if(!confirm(`Ascend now and earn ${gain} karma? This resets most progress.`)) return;
    S.karma.points += gain; S.ascensions++;
    const keep = { ascensions:S.ascensions, karma:S.karma };
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
  advanceMining(S);
  
  // Physique training progression
  const sessionEnd = tickPhysiqueTraining(S);
  if(sessionEnd){
    log(`Training session complete! ${sessionEnd.hits} hits for ${sessionEnd.xp} XP`, 'good');
  }
  
  // Auto meditation fallback for old saves
  if(S.auto.meditate && Object.values(S.activities).every(a => !a)) {
    const gain = foundationGainPerSec(S) * 0.5; // Reduced when not actively cultivating
    S.foundation = clamp(S.foundation + gain, 0, fCap(S));
  }
  if(S.auto.adventure && !S.activities.adventure){ startActivity('adventure'); }

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

// Mining actions are now handled in the activity panel - no separate function needed



// Init
window.addEventListener('load', ()=>{
  initUI();
  initLawSystem();
  initActivityListeners();
  setupAdventureTabs();
  setupEquipmentTab(); // EQUIP-CHAR-UI
  mountAlchemyUI(S);
  mountKarmaUI(S);
  selectActivity('cultivation'); // Start with cultivation selected
  updateAll();
  tick();
  log('Welcome, cultivator.');
  setInterval(tick, 1000);
});

// CHANGELOG: Added weapon HUD integration.
