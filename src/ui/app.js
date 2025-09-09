/* eslint-disable no-unused-vars */
/* global updateYinYangVisual, updateBreathingStats, updateLotusFoundationFill, showActivity, switchTab, showTab */

// Way of Ascension — Modular JS

import { configReport } from '../config.js';
import { mountDiagnostics } from './diagnostics.js';
import { mountAllFeatureUIs, runAllFeatureTicks } from '../features/index.js';
import { applyDevUnlockPreset } from '../features/devUnlock.js';
import { S, defaultState, save, setState, validateState } from '../shared/state.js';
import { cancelSaveDebounce } from '../shared/saveLoad.js';
import { GameController } from '../game/GameController.js';
import {
  updateRealmUI,
  initRealmUI,
} from '../features/progression/index.js';
import { ensureLaws } from '../features/progression/migrations.js';
import { qs, setText, setFill, log } from '../shared/utils/dom.js';
import { fmt } from '../shared/utils/number.js';
import { emit } from '../shared/events.js';
import { setupAdventureTabs, updateAbilityBar } from '../features/adventure/logic.js';
import { updateCookingSidebar } from '../features/cooking/ui/cookingDisplay.js';
import {
  retreatFromCombat,
  instakillCurrentEnemy
} from '../features/adventure/mutators.js';
import { setupLootUI } from '../features/loot/ui/lootTab.js';
import { renderEquipmentPanel, setupEquipmentTab } from '../features/inventory/ui/CharacterPanel.js'; // EQUIP-CHAR-UI
import { setReduceMotion } from '../features/combat/ui/index.js';
import { setupAbilityUI } from '../features/ability/ui.js';
import { recomputePlayerTotals } from '../features/inventory/logic.js';
import { updateCatchingUI } from '../features/catching/ui/catchingDisplay.js';
import { ensureMindState, xpProgress as mindXpProgress } from '../features/mind/index.js';
import { renderMindMainTab, setupMindTabs } from '../features/mind/ui/mindMainTab.js';
import { renderMindReadingTab } from '../features/mind/ui/mindReadingTab.js';
import { renderMindPuzzlesTab } from '../features/mind/ui/mindPuzzlesTab.js';
import { renderMindStatsTab } from '../features/mind/ui/mindStatsTab.js';
import { updateQiAndFoundation } from '../features/progression/ui/qiDisplay.js';
import { updateCombatStats } from '../features/combat/ui/combatStats.js';
import { updateAdventureProgress, mountAdventureControls } from '../features/adventure/ui/adventureDisplay.js';
import { updateResourceDisplay } from '../features/inventory/ui/resourceDisplay.js';
import { updateKarmaDisplay } from '../features/karma/ui/karmaHUD.js';
import { updateLawsUI } from '../features/progression/ui/lawsHUD.js';
import { calcKarmaGain } from '../features/karma/selectors.js';
import { toggleAutoMeditate, toggleAutoAdventure } from '../features/automation/mutators.js';
import { isAutoMeditate, isAutoAdventure } from '../features/automation/selectors.js';
import { selectActivity as selectActivityMut, startActivity as startActivityMut, stopActivity as stopActivityMut } from '../features/activity/mutators.js';
import { mountActivityUI, updateActivitySelectors, renderActiveActivity } from '../features/activity/ui/activityUI.js';
import { meditate } from '../features/progression/mutators.js';
import { sellJunk } from '../features/inventory/mutators.js';
import { usePill } from '../features/alchemy/mutators.js';
import { initSideLocations } from '../features/sideLocations/logic.js';

let controller;

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

// Activity Management System (delegates to feature)
function selectActivity(activityType) { selectActivityMut(S, activityType); }
function startActivity(activityName)  { startActivityMut(S, activityName); }
function stopActivity(activityName)   { stopActivityMut(S, activityName); }

// Import enemy data from the enemies module
import { ENEMY_DATA } from '../features/adventure/data/enemies.js';

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
        controller?.stop();          // halt runAllFeatureTicks
        cancelSaveDebounce();        // clear pending autosave
        try {
          localStorage.clear();      // remove all stored keys
        } catch {}
        Object.assign(S, defaultState());
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

  // HP/Shield & combat stats are rendered by updateCombatStats()
  updateCombatStats();


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
// Controller-driven frame
function frame(root, dtMs) {
  root.time = (root.time || 0) + 1;
  runAllFeatureTicks(root, dtMs);
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
    log('Welcome, cultivator.');
    // Own the loop via GameController (fixed 1000ms for now)
    controller = new GameController(S, 1000).setFrame(frame);
    controller.start();
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
