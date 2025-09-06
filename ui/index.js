/* eslint-disable no-unused-vars */
/* global updateYinYangVisual, updateBreathingStats, updateLotusFoundationFill, showActivity, switchTab, showTab */

// Way of Ascension — Modular JS

import { configReport } from '../src/config.js';
import { mountDiagnostics } from '../src/ui/diagnostics.js';
import { mountAllFeatureUIs } from '../src/features/index.js';
import { applyDevUnlockPreset } from '../src/features/devUnlock.js';
import { S, defaultState, save, setState, validateState } from '../src/shared/state.js';
import {
  clamp,
  qCap,
  qiRegenPerSec,
  fCap,
  foundationGainPerSec,
  powerMult,
  calculatePlayerCombatAttack,
  calculatePlayerAttackRate,
} from '../src/features/progression/selectors.js';
import { refillShieldFromQi } from '../src/features/combat/logic.js';
import {
  updateRealmUI,
  updateActivityCultivation,
  updateBreakthrough,
  initRealmUI,
} from '../src/features/progression/index.js';
import { ensureLaws } from '../src/features/progression/migrations.js';
import { qs, setText, setFill, log } from '../src/shared/utils/dom.js';
import { fmt } from '../src/shared/utils/number.js';
import { emit } from '../src/shared/events.js';
import { createProgressBar, updateProgressBar } from './components/progressBar.js';
import {
  updateActivityAdventure,
  updateAdventureCombat,
  setupAdventureTabs,
  updateAbilityBar
} from '../src/features/adventure/logic.js';
import { updateActivityCooking, updateCookingSidebar } from '../src/features/cooking/ui/cookingDisplay.js';
import {
  retreatFromCombat,
  instakillCurrentEnemy
} from '../src/features/adventure/mutators.js';
import { updateWeaponProficiencyDisplay } from '../src/features/proficiency/ui/weaponProficiencyDisplay.js';
import { setupLootUI } from '../src/features/loot/ui/lootTab.js';
import { renderEquipmentPanel, setupEquipmentTab } from '../src/features/inventory/ui/CharacterPanel.js'; // EQUIP-CHAR-UI
import { ZONES } from '../src/features/adventure/data/zones.js'; // MAP-UI-UPDATE
import { setReduceMotion } from '../src/features/combat/ui/index.js';
import { tickAbilityCooldowns } from '../src/features/ability/mutators.js';
import { setupAbilityUI } from '../src/features/ability/ui.js';
import { recomputePlayerTotals } from '../src/features/inventory/logic.js';
import { advanceMining } from '../src/features/mining/logic.js';
import { advanceGathering } from '../src/features/gathering/logic.js';
import { advanceForging } from '../src/features/forging/logic.js';
import { advanceCatching } from '../src/features/catching/logic.js';
import { updateCatchingUI } from '../src/features/catching/ui/catchingDisplay.js';
import { ensureMindState, xpProgress as mindXpProgress, onTick as mindOnTick } from '../src/features/mind/index.js';
import { renderMindMainTab, setupMindTabs } from '../src/features/mind/ui/mindMainTab.js';
import { renderMindReadingTab } from '../src/features/mind/ui/mindReadingTab.js';
import { renderMindPuzzlesTab } from '../src/features/mind/ui/mindPuzzlesTab.js';
import { renderMindStatsTab } from '../src/features/mind/ui/mindStatsTab.js';
import { updateQiAndFoundation } from '../src/features/progression/ui/qiDisplay.js';
import { updateCombatStats } from '../src/features/combat/ui/combatStats.js';
import { updateAdventureProgress, mountAdventureControls } from '../src/features/adventure/ui/adventureDisplay.js';
import { updateResourceDisplay } from '../src/features/inventory/ui/resourceDisplay.js';
import { updateKarmaDisplay } from '../src/features/karma/ui/karmaHUD.js';
import { updateLawsUI } from '../src/features/progression/ui/lawsHUD.js';
import { calcKarmaGain } from '../src/features/karma/selectors.js';
import { tickPhysiqueTraining } from '../src/features/physique/mutators.js';
import { tickAgilityTraining } from '../src/features/agility/mutators.js';
import { toggleAutoMeditate, toggleAutoAdventure } from '../src/features/automation/mutators.js';
import { isAutoMeditate, isAutoAdventure } from '../src/features/automation/selectors.js';
import { selectActivity as selectActivityMut, startActivity as startActivityMut, stopActivity as stopActivityMut } from '../src/features/activity/mutators.js';
import { mountActivityUI, updateActivitySelectors, updateCurrentTaskDisplay, renderActiveActivity } from '../src/features/activity/ui/activityUI.js';
import { meditate } from '../src/features/progression/mutators.js';
import { tickInsight } from '../src/features/progression/insight.js';
import { usePill, sellJunk } from '../src/features/inventory/mutators.js';
import { initSideLocations } from '../src/features/sideLocations/logic.js';

const report = configReport();
if (report.isProd) {
  const active = Object.entries(report.flags)
    .filter(([k, v]) => k.startsWith('FEATURE_') && v.parsedValue)
    .map(([k]) => k)
    .join(', ') || 'none';
  console.log(`[Way of Ascension] Flags active (prod): ${active}`);
} else {
  console.groupCollapsed('[Way of Ascension] Flag Report');
  console.table(report.flags);
  console.groupEnd();
}

// Global variables
const progressBars = {};


// Activity Management System (delegates to feature)
function selectActivity(activityType) { selectActivityMut(S, activityType); }
function startActivity(activityName)  { startActivityMut(S, activityName); }
function stopActivity(activityName)   { stopActivityMut(S, activityName); }






// Import enemy data from the enemies module
import { ENEMY_DATA } from '../src/features/adventure/data/enemies.js';

// Adventure System Data
// Enemy data for adventure zones

function initUI(){
  // Ensure Mind feature state exists for UI reads
  ensureMindState(S);
  applyDevUnlockPreset(S);
  initSideLocations(S);

  mountAllFeatureUIs(S);

  setupAbilityUI();

  // Assign buttons
  // Buttons (with safe null checks)
  const meditateBtn = qs('#meditateBtn');
  if (meditateBtn) meditateBtn.addEventListener('click', () => { const g = meditate(S); log(`Meditated: +${g.toFixed(1)} Foundation`); updateAll(); });
  initRealmUI();


  const useQiPill = qs('#useQiPill');
  if (useQiPill) useQiPill.addEventListener('click', ()=>{ usePill(S,'qi'); updateAll(); });

  const useBodyPill = qs('#useBodyPill');
  if (useBodyPill) useBodyPill.addEventListener('click', ()=>{ usePill(S,'body'); updateAll(); });

  const useWardPill = qs('#useWardPill');
  if (useWardPill) useWardPill.addEventListener('click', ()=>{ usePill(S,'ward'); updateAll(); });

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
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Hard reset?')) {
        // Wipe all persisted data so no stray keys survive a reset.
        // This covers older save slots and any feature-specific flags.
        try {
          localStorage.clear();
        } catch {}
        setState(defaultState());
        save();
        location.reload();
      }
    });
  }
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
      inp.onchange=()=>{ const f=inp.files[0]; const r=new FileReader(); r.onload=()=>{ try{ const parsed = JSON.parse(r.result); const v = validateState(parsed); if(!v) throw new Error('bad'); setState(v); save(); location.reload(); }catch{ alert('Invalid file'); } }; r.readAsText(f); };
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
  setupLootUI({ retreatFromCombat, renderEquipmentPanel });

  // Safe render calls
  updateAll();
}

function updateAll(){
  updateRealmUI();
  updateQiAndFoundation();

  // HP
  const hpFrac = S.hpMax ? S.hp / S.hpMax : 0;
  const shieldMax = S.shield?.max || 0;
  const shieldCur = S.shield?.current || 0;
  const shieldFrac = shieldMax ? shieldCur / shieldMax : 0;
  setText('hpVal', fmt(S.hp)); setText('hpMax', fmt(S.hpMax));
  setFill('hpFill', hpFrac);
  setFill('hpMaskRect', hpFrac);
  setFill('shieldFill', shieldFrac);
  const overlay = qs('.shield-overlay');
  if (overlay) overlay.style.display = shieldFrac > 0 ? '' : 'none';
  const hpA11y = qs('#hpA11y');
  if (hpA11y) hpA11y.textContent = `HP ${fmt(S.hp)}/${fmt(S.hpMax)}, Shield ${fmt(shieldCur)}/${fmt(shieldMax)}`;
  updateCombatStats();
  updateCurrentTaskDisplay(S);


  // Update progression displays
  setFill('physiqueProgressFill', S.physique.exp / S.physique.expMax);
  setText('physiqueProgressText', `${fmt(S.physique.exp)} / ${fmt(S.physique.expMax)} XP`);
  setText('physiqueLevel', `Level ${S.physique.level}`);
  const mindProg = mindXpProgress(S.mind.xp);
  setFill('mindProgressFill', mindProg.current / mindProg.next);
  setText('mindProgressText', `${fmt(mindProg.current)} / ${fmt(mindProg.next)} XP`);
  setText('mindLevel', `Level ${S.mind.level}`);

  updateCookingSidebar();

  updateAdventureProgress();

  // activity UI refresh:
  updateActivitySelectors(S);
  renderActiveActivity(S);

  updateResourceDisplay();

  updateCatchingUI(S);

  // Disciples

  updateKarmaDisplay();
  updateLawsUI();
  renderMindMainTab(document.getElementById('mindMainTab'), S);
  renderMindReadingTab(document.getElementById('mindReadingTab'), S);
  renderMindStatsTab(document.getElementById('mindStatsTab'), S);
  renderMindPuzzlesTab(document.getElementById('mindPuzzlesTab'), S);

  emit('RENDER');
}

// Upgrades
function canPay(cost){ return Object.entries(cost).every(([k,v])=> (S[k]||0) >= v); }
function pay(cost){ if(!canPay(cost)) return false; Object.entries(cost).forEach(([k,v])=> S[k]-=v); return true; }
function buy(u){ if(S.bought[u.key]) return false; if(!pay(u.cost)) { log('Not enough resources','bad'); return false; } u.apply(S); S.bought[u.key]=true; log(`Bought ${u.name}`,'good'); return true; }


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

  // Mind manual progression
  mindOnTick(S, 1);

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
  advanceGathering(S);
  advanceForging(S);
  advanceCatching(S);
  
  // Physique training progression
  const physSessionEnd = tickPhysiqueTraining(S);
  if(physSessionEnd){
    let msg = `Training session complete! ${physSessionEnd.hits} hits for ${physSessionEnd.xp} XP`;
    if(physSessionEnd.qiRecovered){
      msg += ` and recovered ${physSessionEnd.qiRecovered.toFixed(0)} Qi`;
    }
    log(msg, 'good');
  }

  // Agility training progression
  const agiSessionEnd = tickAgilityTraining(S);
  if(agiSessionEnd){
    const msg = `Agility session complete! ${agiSessionEnd.hits} hits for ${agiSessionEnd.xp} XP`;
    log(msg, 'good');
  }
  
  // Auto meditation fallback for old saves
  if(isAutoMeditate() && Object.values(S.activities).every(a => !a)) {
    const gain = foundationGainPerSec(S) * 0.5; // Reduced when not actively cultivating
    S.foundation = clamp(S.foundation + gain, 0, fCap(S));
  }
  if(isAutoAdventure() && !S.activities.adventure){ startActivity('adventure'); }

  // Insight gain
  tickInsight(S, 1);

  // Breakthrough progress
  updateBreakthrough();

  // Adventure combat
  if(S.activities.adventure && S.adventure && S.adventure.inCombat) {
    updateAdventureCombat();
  }

  updateActivitySelectors(S); // Update activity progress bars every tick
  updateAll();
  updateAbilityBar();
}

function setupMobileUI() {
  const menu = qs('#menuButton');
  const sidebar = qs('#sidebar');
  const scrim = qs('#drawerScrim');
  if (!menu || !sidebar || !scrim) return;
  const mq = window.matchMedia('(max-width: 768px)');
  let first, last;
  function trap(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); (last || first).focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); (first || last).focus(); }
  }
  function close(focusMenu = true) {
    sidebar.classList.remove('open');
    scrim.classList.remove('active');
    scrim.hidden = true;
    document.body.classList.remove('drawer-open');
    menu.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-hidden', 'true');
    window.removeEventListener('keydown', esc);
    window.removeEventListener('keydown', trap);
    if (focusMenu) menu.focus();
  }
  function esc(e) { if (e.key === 'Escape') close(); }
  function open() {
    const focusables = sidebar.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    first = focusables[0];
    last = focusables[focusables.length - 1];
    sidebar.classList.add('open');
    scrim.hidden = false;
    scrim.classList.add('active');
    document.body.classList.add('drawer-open');
    menu.setAttribute('aria-expanded', 'true');
    sidebar.setAttribute('aria-hidden', 'false');
    (first || sidebar).focus();
    window.addEventListener('keydown', esc);
    window.addEventListener('keydown', trap);
  }
  menu.addEventListener('click', open);
  scrim.addEventListener('click', () => close());
  function apply(e) {
    if (e.matches) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
      close(false);
    } else {
      sidebar.removeAttribute('aria-hidden');
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      sidebar.classList.remove('open');
      scrim.classList.remove('active');
      scrim.hidden = true;
      document.body.classList.remove('drawer-open');
      menu.setAttribute('aria-expanded', 'false');
    }
  }
  mq.addEventListener('change', apply);
  apply(mq);
}

function setupLogSheet() {
  const sheet = qs('#logSheet');
  const toggle = qs('#logToggle');
  if (!sheet || !toggle) return;

  function setHeight() {
    const h = sheet.getAttribute('data-open') === 'true'
      ? sheet.offsetHeight
      : toggle.offsetHeight;
    document.documentElement.style.setProperty('--log-h', `${h}px`);
  }

  const ro = new ResizeObserver(setHeight);
  ro.observe(sheet);
  ro.observe(toggle);
  function close() {
    sheet.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    sheet.removeAttribute('role');
    sheet.removeAttribute('aria-modal');
    toggle.textContent = 'Log \u25BE';
    toggle.focus();
    setHeight();
    window.removeEventListener('keydown', esc);
  }
  function open() {
    sheet.setAttribute('data-open', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    toggle.textContent = 'Log \u25B4';
    setHeight();
    window.addEventListener('keydown', esc);
  }
  function esc(e) { if (e.key === 'Escape') close(); }
  toggle.addEventListener('click', () => {
    sheet.getAttribute('data-open') === 'true' ? close() : open();
  });
  window.addEventListener('resize', setHeight);
  window.addEventListener('orientationchange', setHeight);
  setHeight();
}

function enableLayoutDebug() {
  if (!window.DEBUG) return;
  document.documentElement.classList.add('layout-debug');
  const check = () => {
    document.querySelectorAll('body *').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 1) {
        console.warn('[layout]', el);
      }
    });
  };
  window.addEventListener('resize', check);
  check();
}



// Init
  window.addEventListener('load', ()=>{
    initUI();
    setupMobileUI();
    setupLogSheet();
    enableLayoutDebug();
    ensureLaws(S);
    mountActivityUI(S);
    mountAdventureControls(S);
    setupAdventureTabs();
    setupMindTabs();
    setupEquipmentTab(); // EQUIP-CHAR-UI
    // Ensure derived stats like Qi shield are initialized based on equipped gear
    recomputePlayerTotals(S);
    mountDiagnostics(S);
    renderMindMainTab(document.getElementById('mindMainTab'), S);
    renderMindReadingTab(document.getElementById('mindReadingTab'), S);
    renderMindStatsTab(document.getElementById('mindStatsTab'), S);
    renderMindPuzzlesTab(document.getElementById('mindPuzzlesTab'), S);
    selectActivity('cultivation'); // Start with cultivation selected
    updateAll();
    tick();
    log('Welcome, cultivator.');
    setInterval(tick, 1000);
    setInterval(() => {
    const junk = S.junk || [];
    const total = junk.reduce((sum, it) => sum + (it.qty || 1), 0);
    if (junk.length === 0) {
      alert('A travelling merchant stops by, but you have no junk to sell.');
      return;
    }
    if (confirm(`A travelling merchant arrives! Sell all junk for ${total} coin?`)) {
      sellJunk(S);
      renderEquipmentPanel();
    }
  }, 3600000);
});

// CHANGELOG: Added weapon HUD integration.
