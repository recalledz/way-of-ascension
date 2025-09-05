import { ZONES } from '../../adventure/data/zones.js';
import { startCatch } from '../mutators.js';
import { setText } from '../../../shared/utils/dom.js';
import { fmt } from '../../../shared/utils/number.js';

function renderCaughtCreatures(state){
  const container = document.getElementById('caughtCreatures');
  if(!container) return;
  container.innerHTML = '';
  state.catching?.creatures?.forEach(creature => {
    const div = document.createElement('div');
    div.className = 'creature-entry';
    const hungerPct = Math.floor((creature.hunger ?? 0) * 100);
    const tameText = creature.tamed ? 'Tamed' : `${Math.floor(creature.tameProgress || 0)}%`;
    div.innerHTML = `
      <div class="creature-header">
        <iconify-icon icon="${creature.icon}" class="creature-icon"></iconify-icon>
        <span class="creature-name">${creature.name}</span>
        <span class="tame-status">${tameText}</span>
      </div>
      <div class="bar"><div class="fill" style="width:${hungerPct}%"></div></div>
      <div class="creature-actions">
        <button class="btn small feed">Feed</button>
        <button class="btn small tame">Tame</button>
      </div>`;
    container.appendChild(div);
    div.querySelector('.feed')?.addEventListener('click', () => {
      creature.hunger = 1;
      creature.lastFed = Date.now();
      creature.tameProgress = Math.min(100, (creature.tameProgress || 0) + 20);
      renderCaughtCreatures(state);
    });
    div.querySelector('.tame')?.addEventListener('click', () => {
      const now = Date.now();
      if(now - (creature.lastTameAttempt || 0) < 3600 * 1000) return;
      creature.lastTameAttempt = now;
      if(Math.random() < (creature.tameProgress || 0) / 100){
        creature.tamed = true;
        creature.tameProgress = 100;
      }
      renderCaughtCreatures(state);
    });
  });
}

export function mountCatchingUI(state){
  const select = document.getElementById('catchingLocation');
  const chanceEl = document.getElementById('catchChance');
  const netsEl = document.getElementById('catchingNets');
  if(select){
    ZONES.forEach((zone, zi) => {
      if(zi < (state.adventure?.zonesUnlocked || 1)){
        zone.areas.forEach((area, ai) => {
          const opt = document.createElement('option');
          opt.value = `${zi}-${ai}`;
          opt.textContent = `${zone.name} - ${area.name}`;
          select.appendChild(opt);
        });
      }
    });

    const updateChance = () => {
      const [zi, ai] = select.value.split('-').map(Number);
      const stage = (ai ?? 0) + 1;
      const chance = Math.pow(0.5, stage);
      if(chanceEl) chanceEl.textContent = `${Math.floor(chance * 100)}%`;
    };
    select.addEventListener('change', updateChance);
    updateChance();
  }

  if(netsEl) netsEl.textContent = state.catching?.nets ?? 0;

  document.getElementById('catchCritterBtn')?.addEventListener('click', () => {
    if(!select) return;
    const [zi, ai] = select.value.split('-').map(Number);
    if(startCatch(state, zi, ai) && netsEl){
      netsEl.textContent = state.catching.nets;
    }
  });

  document.querySelectorAll('#activity-catching .catching-subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.subtab;
      document.querySelectorAll('#activity-catching .catching-subtab').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('#activity-catching .catching-subtab-content').forEach(panel => {
        panel.style.display = panel.id === id ? '' : 'none';
      });
    });
  });

  renderCaughtCreatures(state);
}

export function updateCatchingUI(state){
  renderCaughtCreatures(state);
  const root = state.catching || state;
  const netsEl = document.getElementById('catchingNets');
  if(netsEl) netsEl.textContent = root.nets ?? 0;
  const progressFill = document.getElementById('catchProgressFill');
  if(progressFill){
    const pct = (root.currentCatch?.progress ?? 0) * 100;
    progressFill.style.width = `${pct}%`;
  }
  const levelEl = document.getElementById('catchingLevel');
  if (levelEl) levelEl.textContent = `Level ${root.level}`;
  const xpFill = document.getElementById('catchingProgressFill');
  if (xpFill) {
    const frac = root.exp / root.expMax;
    xpFill.style.width = `${frac * 100}%`;
    setText('catchingProgressText', `${fmt(root.exp)} / ${fmt(root.expMax)} XP`);
  }
}
