import { on } from '../../../shared/events.js';
import { setText } from '../../../shared/utils/dom.js';
import { ZONES } from '../../adventure/data/zones.js';
import { attemptCatch, feedCreature, attemptTame } from '../logic.js';

function populateLocations(state){
  const select = document.getElementById('catchLocation');
  if (!select) return;
  select.innerHTML = '';
  const unlocked = state.adventure?.unlockedAreas || {};
  ZONES.forEach((zone, zi) => {
    zone.areas.forEach((area, ai) => {
      if (unlocked[`${zi}-${ai}`]) {
        const opt = document.createElement('option');
        opt.value = `${zi}-${ai}`;
        opt.textContent = `${zone.name} - ${area.name}`;
        select.appendChild(opt);
      }
    });
  });
}

function renderCreatures(state){
  const container = document.getElementById('caughtCreatures');
  if (!container) return;
  container.innerHTML = '';
  state.catching?.creatures?.forEach((c, idx) => {
    const div = document.createElement('div');
    div.className = 'caught-creature';
    const hunger = Math.floor(c.hunger);
    div.innerHTML = `
      <div class="stat"><span class="creature-icon">${c.icon}</span><span>${c.name}</span></div>
      <div class="bar"><div class="fill" style="width:${hunger}%"></div></div>
      <div class="muted">${c.tamed ? 'Tamed' : `Tame Chance: ${Math.floor(c.tameProgress)}%`}</div>
    `;
    if (!c.tamed){
      const feedBtn = document.createElement('button');
      feedBtn.className = 'btn small';
      feedBtn.textContent = 'Feed';
      feedBtn.onclick = () => { feedCreature(c); renderCreatures(state); updateSidebar(state); };
      const tameBtn = document.createElement('button');
      tameBtn.className = 'btn small';
      tameBtn.textContent = 'Tame';
      tameBtn.disabled = c.tameCooldown > 0;
      tameBtn.onclick = () => {
        const res = attemptTame(c);
        if (res.ok){
          const msg = document.getElementById('catchResult');
          if (res.success) msg.textContent = `${c.name} is now tamed!`;
          else msg.textContent = `${c.name} resisted taming.`;
          renderCreatures(state); updateSidebar(state);
        }
      };
      div.appendChild(feedBtn);
      div.appendChild(tameBtn);
    }
    container.appendChild(div);
  });
}

function updateSidebar(state){
  const tamed = state.catching?.creatures?.filter(c=>c.tamed).length || 0;
  const total = state.catching?.creatures?.length || 0;
  setText('catchingLevel', `${tamed} Tamed`);
  const fill = document.getElementById('catchingProgressFill');
  const txt = document.getElementById('catchingProgressText');
  if (fill && txt){
    const pct = total ? (tamed/total*100) : 0;
    fill.style.width = pct + '%';
    txt.textContent = `${pct.toFixed(0)}%`;
  }
}

function render(state){
  populateLocations(state);
  renderCreatures(state);
  updateSidebar(state);
}

export function mountCatchingUI(state){
  const btn = document.getElementById('attemptCatchBtn');
  if (btn){
    btn.addEventListener('click', () => {
      const select = document.getElementById('catchLocation');
      const val = select?.value;
      if (!val) return;
      const [zi, ai] = val.split('-').map(Number);
      const res = attemptCatch(state, zi, ai);
      const msg = document.getElementById('catchResult');
      if (res.success){
        msg.textContent = `Caught a ${res.creature.name}!`;
        renderCreatures(state); updateSidebar(state);
      } else {
        msg.textContent = 'The creature escaped!';
      }
    });
  }

  const tabBtns = document.querySelectorAll('.catching-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.catching-tab-content').forEach(el=>{ el.classList.remove('active'); el.style.display='none'; });
      btn.classList.add('active');
      const content = document.getElementById(tab + 'Tab');
      if(content){ content.classList.add('active'); content.style.display='block'; }
    });
  });

  on('RENDER', () => render(state));
  render(state);
}
