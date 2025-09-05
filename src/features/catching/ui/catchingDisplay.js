import { ZONES } from '../../adventure/data/zones.js';
import { startActivity } from '../../activity/mutators.js';
import { attemptTame } from '../logic.js';
import { getIcon } from '../data.js';

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
      attemptTame(creature);
      renderCaughtCreatures(state);
    });
  });
}

export function mountCatchingUI(state){
  const select = document.getElementById('catchingLocation');
  const netsEl = document.getElementById('catchingNets');
  const chanceEl = document.getElementById('catchChance');
  const progressFill = document.getElementById('catchingProgressFill');
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
  }

  const updateChance = () => {
    if(!select || !chanceEl) return;
    const [zi, ai] = select.value.split('-').map(Number);
    const stage = (ai ?? 0) + 1;
    const chance = Math.pow(0.5, stage);
    chanceEl.textContent = `Chance: ${(chance * 100).toFixed(1)}%`;
  };

  select?.addEventListener('change', updateChance);
  updateChance();

  document.getElementById('catchCritterBtn')?.addEventListener('click', () => {
    if(!select || state.catching.currentAttempt) return;
    if((state.catching.nets || 0) <= 0) return;
    const [zi, ai] = select.value.split('-').map(Number);
    const zone = ZONES[zi];
    const area = zone?.areas?.[ai];
    if(!area) return;
    const stage = ai + 1;
    const baseMinutes = 10 + 5 * stage;
    const agi = state.agility?.level || 0;
    const duration = baseMinutes * 60000 * Math.max(0, 1 - 0.04 * agi);
    state.catching.nets--;
    state.catching.currentAttempt = { zi, ai, stage, start: Date.now(), duration };
    startActivity(state, 'catching');
    if(netsEl) netsEl.textContent = state.catching.nets;
    if(progressFill) progressFill.style.width = '0%';
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
  if(netsEl) netsEl.textContent = state.catching.nets ?? 0;
  updateChance();
}

export function updateCatchingUI(state){
  const netsEl = document.getElementById('catchingNets');
  const progressFill = document.getElementById('catchingProgressFill');
  renderCaughtCreatures(state);
  if(netsEl) netsEl.textContent = state.catching.nets ?? 0;
  const attempt = state.catching.currentAttempt;
  if(progressFill){
    if(attempt){
      const pct = Math.min(100, ((Date.now() - attempt.start) / attempt.duration) * 100);
      progressFill.style.width = `${pct}%`;
    } else {
      progressFill.style.width = '0%';
    }
  }
}
