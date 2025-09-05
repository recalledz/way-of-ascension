import { on } from '../../../shared/events.js';
import { getCrittersForLocation, catchCritter, feedCreature, tameCreature } from '../logic.js';

function render(state){
  const { catching } = state;
  const locSelect = document.getElementById('catchingLocation');
  if(locSelect){
    locSelect.innerHTML = catching.unlockedLocations.map(l => `<option value="${l}">${l}</option>`).join('');
    locSelect.value = catching.selectedLocation;
  }

  const critterList = document.getElementById('catchingAvailableCritters');
  if(critterList){
    const critters = getCrittersForLocation(catching.selectedLocation, state);
    critterList.innerHTML = critters.map(c => `
      <div class="catch-row">
        <iconify-icon icon="${c.icon}" width="24"></iconify-icon>
        <span>${c.name}</span>
        <button class="btn small" data-catch="${c.id}">Catch</button>
      </div>
    `).join('');
    critterList.querySelectorAll('button[data-catch]').forEach(btn => {
      btn.addEventListener('click', () => {
        catchCritter(catching.selectedLocation, btn.dataset.catch, state);
        render(state);
      });
    });
  }

  const capturedList = document.getElementById('catchingCaptured');
  if(capturedList){
    capturedList.innerHTML = catching.captured.map(creature => `
      <div class="creature-row">
        <iconify-icon icon="${creature.icon}" width="24"></iconify-icon>
        <span>${creature.name}</span>
        <div class="bar"><div class="fill" style="width:${creature.hunger}%"></div></div>
        ${creature.tamed ? '<span class="muted">Tamed</span>' : `
          <button class="btn small" data-feed="${creature.id}">Feed</button>
          <button class="btn small" data-tame="${creature.id}">Tame</button>
          <span>${Math.floor(creature.tameProgress)}%</span>
        `}
      </div>
    `).join('');
    capturedList.querySelectorAll('button[data-feed]').forEach(btn => {
      btn.addEventListener('click', () => {
        feedCreature(btn.dataset.feed, state);
        render(state);
      });
    });
    capturedList.querySelectorAll('button[data-tame]').forEach(btn => {
      btn.addEventListener('click', () => {
        tameCreature(btn.dataset.tame, state);
        render(state);
      });
    });
  }
}

export function mountCatchingUI(state){
  const locSelect = document.getElementById('catchingLocation');
  locSelect?.addEventListener('change', e => {
    state.catching.selectedLocation = e.target.value;
    render(state);
  });
  on('RENDER', () => render(state));
  document.querySelectorAll('.catching-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.catching-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.catching-tab-content').forEach(tab => {
        tab.style.display = tab.id === btn.dataset.tab + 'SubTab' ? 'block' : 'none';
      });
    });
  });
  render(state);
}
