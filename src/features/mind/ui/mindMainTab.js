// src/features/mind/ui/mindMainTab.js

import { mindBreakdown } from '../selectors.js';
import { craftTalisman } from '../mutators.js';
import { listTalismanRecipes } from '../data/talismans.js';
import { renderMindReadingTab } from './mindReadingTab.js';
import { renderMindPuzzlesTab } from './mindPuzzlesTab.js';
import { renderMindStatsTab } from './mindStatsTab.js';
import { S, save } from '../../../shared/state.js';

let lastXp = 0;
let lastTime = Date.now();

/**
 * Render the Mind Main tab UI.
 * @param {HTMLElement} rootEl container element
 * @param {object} state game state
 */
export function renderMindMainTab(rootEl, state) {
  if (!rootEl) return;
  const breakdown = mindBreakdown(state);

  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  const gained = state.mind.xp - lastXp;
  const perHour = dt > 0 ? (gained / dt) * 3600 : 0;
  lastXp = state.mind.xp;
  lastTime = now;

  rootEl.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Mind Overview</h3>
    <div class="stat"><span>Level</span><span>${state.mind.level}</span></div>
    <div class="stat"><span>Total XP</span><span>${breakdown.total.toFixed(1)}</span></div>
    <div class="stat"><span>XP/hr</span><span>${perHour.toFixed(1)}</span></div>
  `;

  const table = document.createElement('table');
  table.innerHTML = `
    <thead><tr><th>Source</th><th>XP</th></tr></thead>
    <tbody>
      <tr><td>Proficiency</td><td>${(breakdown.sources.proficiency * breakdown.multiplier).toFixed(1)}</td></tr>
      <tr><td>Reading</td><td>${(breakdown.sources.reading * breakdown.multiplier).toFixed(1)}</td></tr>
      <tr><td>Crafting</td><td>${(breakdown.sources.crafting * breakdown.multiplier).toFixed(1)}</td></tr>
      <tr><td>Multiplier</td><td>x${breakdown.multiplier.toFixed(2)}</td></tr>
    </tbody>
  `;
  card.appendChild(table);
  rootEl.appendChild(card);

  // Mind attribute breakdown
  const mindAttr = state.attributes?.mind ?? 0;
  const mindPoints = state.mind.level; // each level grants one point
  const attrCard = document.createElement('div');
  attrCard.className = 'card';
  attrCard.innerHTML = `
    <h4>Mind Attribute</h4>
    <div class="stat"><span>Mind Points</span><span>${mindPoints}</span></div>
    <div class="stat"><span>Total Mind</span><span>${mindAttr}</span></div>
    <div class="stat"><span>Spell Power</span><span>+${(mindPoints * 6).toFixed(1)}% (6%/pt)</span></div>
    <div class="stat"><span>Alchemy Success</span><span>+${(mindPoints * 4).toFixed(1)}% (4%/pt)</span></div>
    <div class="stat"><span>Learning Speed</span><span>+${(mindPoints * 5).toFixed(1)}% (5%/pt)</span></div>
  `;
  rootEl.appendChild(attrCard);

  // Temporary talisman craft tester
  const craftCard = document.createElement('div');
  craftCard.className = 'card';
  craftCard.innerHTML = '<h4>Craft Test</h4>';

  const select = document.createElement('select');
  select.className = 'btn';
  for (const t of listTalismanRecipes()) {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    select.appendChild(opt);
  }

  const craftBtn = document.createElement('button');
  craftBtn.className = 'btn primary';
  craftBtn.textContent = 'Craft';
  const result = document.createElement('div');
  result.className = 'muted';

  craftBtn.addEventListener('click', () => {
    const id = select.value;
    const before = state.mind.xp;
    if (craftTalisman(state, id)) {
      const gainedXp = state.mind.xp - before;
      result.textContent = `Gained ${gainedXp.toFixed(1)} xp`;
      save?.();
      renderMindMainTab(rootEl, state);
    }
  });

  const row = document.createElement('div');
  row.className = 'row';
  row.appendChild(select);
  row.appendChild(craftBtn);
  craftCard.appendChild(row);
  craftCard.appendChild(result);
  rootEl.appendChild(craftCard);
}

let tabsInitialized = false;
export function setupMindTabs() {
  if (tabsInitialized) return;
  const tabButtons = document.querySelectorAll('.mind-tab-btn');
  tabButtons.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.mind-tab-content').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
      });
      btn.classList.add('active');
      const content = document.getElementById(tab + 'Tab');
      if (content) {
        content.classList.add('active');
        content.style.display = 'block';
      }
      switch (tab) {
        case 'mindMain':
          renderMindMainTab(content, S);
          break;
        case 'mindReading':
          renderMindReadingTab(content, S);
          break;
        case 'mindStats':
          renderMindStatsTab(content, S);
          break;
        case 'mindPuzzles':
          renderMindPuzzlesTab(content, S);
          break;
      }
    };
  });
  tabsInitialized = true;
}

export default renderMindMainTab;

