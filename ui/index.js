/* eslint-disable no-unused-vars */
/* global updateYinYangVisual, updateBreathingStats, updateLotusFoundationFill, showActivity, switchTab, showTab */

// Way of Ascension — Modular JS

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
  startAdventure,
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
import { toggleAutoMeditate, toggleAutoAdventure } from '../src/features/automation/mutators.js';
import { isAutoMeditate, isAutoAdventure } from '../src/features/automation/selectors.js';
import { selectActivity, startActivity, stopActivity } from '../src/features/activity/mutators.js';
import { getSelectedActivity } from '../src/features/activity/selectors.js';
import { mountActivityUI, updateActivitySelectors } from '../src/features/activity/ui/activityUI.js';

// Global variables
const progressBars = {};

// Expose activity controls globally for compatibility
globalThis.startActivity = name => startActivity(S, name);
globalThis.stopActivity = name => stopActivity(S, name);
globalThis.selectActivity = name => {
  selectActivity(S, name);
  updateActivitySelectors(S);
  if (typeof globalThis.updateActivityContent === 'function') {
    globalThis.updateActivityContent();
  }
};






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
    autoMeditate.checked = isAutoMeditate();
    autoMeditate.addEventListener('change', e => toggleAutoMeditate(e.target.checked));
  }


  const autoAdventure = qs('#autoAdventure');
  if (autoAdventure) {
    autoAdventure.checked = isAutoAdventure();
    autoAdventure.addEventListener('change', e => toggleAutoAdventure(e.target.checked));
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
  updateActivitySelectors(S);


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



function updateActivityContent() {
  // Update cultivation activity content
  updateActivityCultivation();
  const selected = getSelectedActivity(S);
  switch(selected) {
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
globalThis.updateActivityContent = updateActivityContent;


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
    if (getSelectedActivity(S) === 'sect') {
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
  updateActivitySelectors(S);
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
  if(isAutoMeditate() && Object.values(S.activities).every(a => !a)) {
    const gain = foundationGainPerSec(S) * 0.5; // Reduced when not actively cultivating
    S.foundation = clamp(S.foundation + gain, 0, fCap(S));
  }
  if(isAutoAdventure() && !S.activities.adventure){ startActivity(S, 'adventure'); }

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
  // Activity content event listeners
  document.getElementById('useQiPillActivity')?.addEventListener('click', () => usePill('qi'));
  document.getElementById('useWardPillActivity')?.addEventListener('click', () => usePill('ward'));
  
  // Adventure Map button event listener - MAP-UI-UPDATE
  document.getElementById('mapButton')?.addEventListener('click', () => {
    import('../src/features/adventure/ui/mapUI.js').then(({ showMapOverlay }) => {
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
    startAdventure();

    // Start the adventure activity if not already active
    if (!S.activities.adventure) {
      startActivity(S, 'adventure');
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
    startAdventure();

    // Start the adventure activity if not already active
    if (!S.activities.adventure) {
      startActivity(S, 'adventure');
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
  mountActivityUI(S);
  initActivityListeners();
  setupAdventureTabs();
  setupEquipmentTab(); // EQUIP-CHAR-UI
  mountAlchemyUI(S);
  mountKarmaUI(S);
  selectActivity(S, 'cultivation'); // Start with cultivation selected
  updateAll();
  tick();
  log('Welcome, cultivator.');
  setInterval(tick, 1000);
});

// CHANGELOG: Added weapon HUD integration.
