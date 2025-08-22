import { S, save, setState, defaultState } from "../shared/state.js";
import { createGameController } from "../game/GameController.js";
import { updateAll } from "./render.js";

import { renderSidebarActivities } from "./sidebar.js";
import { initializeWeaponChip } from "../features/inventory/ui/weaponChip.js";
import { WEAPONS } from "../features/weaponGeneration/data/weapons.js";
import { mountTrainingGameUI } from "../features/physique/ui/trainingGame.js";
import { setReduceMotion } from "../features/combat/ui/index.js";

import { mountActivityUI } from "../features/activity/ui/activityUI.js";
import { mountAdventureControls } from "../features/adventure/ui/adventureDisplay.js";
import { setupEquipmentTab } from "../features/inventory/ui/CharacterPanel.js";
import { mountAlchemyUI } from "../features/alchemy/ui/alchemyDisplay.js";
import { mountKarmaUI } from "../features/karma/ui/karmaDisplay.js";
import { log } from "../shared/utils/dom.js";

function mountSaveLoadUI() {
  const saveBtn = document.querySelector('#saveBtn');
  saveBtn?.addEventListener('click', save);

  document.querySelector('#resetBtn')?.addEventListener('click', ()=>{
    if(confirm('Hard reset?')){
      setState(defaultState()); save(); location.reload();
    }
  });

  document.querySelector('#exportBtn')?.addEventListener('click', ()=>{
    const blob=new Blob([JSON.stringify(S)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='way-of-ascension-save.json'; a.click(); URL.revokeObjectURL(url);
  });

  document.querySelector('#importBtn')?.addEventListener('click', ()=>{
    const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json';
    inp.onchange=()=>{ const f=inp.files[0]; const r=new FileReader();
      r.onload=()=>{ try{ setState(JSON.parse(r.result)); save(); location.reload(); }catch{ alert('Invalid file'); } };
      r.readAsText(f);
    };
    inp.click();
  });
}

function mountSettingsUI() {
  const reduceMotionToggle = document.querySelector('#reduceMotionToggle');
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
}

function mountQuickButtons() {
  document.querySelector('#meditateBtn')?.addEventListener('click', async () => {
    const { meditate } = await import('../features/progression/mutators.js');
    const g = meditate(S); log(`Meditated: +${g.toFixed(1)} Foundation`);
  });

  document.querySelector('#useQiPill')?.addEventListener('click', async () => {
    const { usePill } = await import('../features/inventory/mutators.js');
    usePill(S, 'qi');
  });
  document.querySelector('#useBodyPill')?.addEventListener('click', async () => {
    const { usePill } = await import('../features/inventory/mutators.js');
    usePill(S, 'body');
  });
  document.querySelector('#useWardPill')?.addEventListener('click', async () => {
    const { usePill } = await import('../features/inventory/mutators.js');
    usePill(S, 'ward');
  });

  const autoMeditate = document.querySelector('#autoMeditate');
  if (autoMeditate) {
    import('../features/automation/selectors.js').then(({ isAutoMeditate }) => {
      autoMeditate.checked = isAutoMeditate();
    });
    autoMeditate.addEventListener('change', async e => {
      const { toggleAutoMeditate } = await import('../features/automation/mutators.js');
      toggleAutoMeditate(e.target.checked);
    });
  }
  const autoAdventure = document.querySelector('#autoAdventure');
  if (autoAdventure) {
    import('../features/automation/selectors.js').then(({ isAutoAdventure }) => {
      autoAdventure.checked = isAutoAdventure();
    });
    autoAdventure.addEventListener('change', async e => {
      const { toggleAutoAdventure } = await import('../features/automation/mutators.js');
      toggleAutoAdventure(e.target.checked);
    });
  }
}

export function startApp() {
  console.log('Starting Way of Ascension');
  // Sidebar & HUD mounts
  renderSidebarActivities();

  // Weapon chip
  const mh = S.equipment?.mainhand;
  const mhKey = typeof mh === 'string' ? mh : mh?.key || 'fist';
  const mhName = WEAPONS[mhKey]?.displayName || (mhKey === 'fist' ? 'Fists' : mhKey);
  initializeWeaponChip({ key: mhKey, name: mhName });

  mountTrainingGameUI(S);
  mountSaveLoadUI();
  mountSettingsUI();
  mountQuickButtons();

  // Feature UIs
  mountActivityUI(S);
  mountAdventureControls(S);
  import("../features/adventure/logic.js").then(({ setupAdventureTabs }) => setupAdventureTabs());
  setupEquipmentTab();
  mountAlchemyUI(S);
  mountKarmaUI(S);

  // Default activity
  import("../features/activity/mutators.js").then(({ selectActivity }) => {
    selectActivity(S, 'cultivation');
    updateAll(S);
  });

  // Game controller + dev hooks
  const game = createGameController(S, { emit: window.emit });
  updateAll(S);
  window.__PAUSE = () => game.pause?.();
  window.__RESUME = () => game.resume?.();
  window.__STEP = () => game.step?.();
  window.__SET_SPEED = (x) => game.setSpeed?.(x);
  window.__GET_SPEED = () => game.getSpeed?.();

  game.start();
  log('Welcome, cultivator.');
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
