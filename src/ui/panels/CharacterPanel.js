import { S, save } from '../../game/state.js';
import { WEAPONS } from '../../data/weapons.js';
import { equipItem, unequip, removeFromInventory } from '../../game/systems/inventory.js';

// Consolidated equipment/inventory panel
let currentFilter = 'all';
let slotFilter = null;

export function renderEquipmentPanel() {
  renderEquipment();
  renderInventory();
}

function renderEquipment() {
  const slots = [
    { key: 'mainhand', label: 'Weapon' },
    { key: 'head', label: 'Head' },
    { key: 'torso', label: 'Torso' },
    { key: 'food', label: 'Food' }
  ];
  slots.forEach(s => {
    const el = document.getElementById(`slot-${s.key}`);
    if (!el) return;
    const item = S.equipment[s.key];
    const name = item?.key ? (WEAPONS[item.key]?.displayName || item.key) : 'Empty';
    el.querySelector('.slot-name').textContent = name;
    el.querySelector('.equip-btn').onclick = () => { slotFilter = s.key; renderInventory(); };
    el.querySelector('.unequip-btn').onclick = () => { unequip(s.key); renderEquipmentPanel(); };
  });
}

function weaponDetailsText(item) {
  const w = WEAPONS[item.key];
  if (!w) return '';
  const base = w.base ? `${w.base.min}-${w.base.max} (${w.base.attackRate}/s)` : 'n/a';
  const scales = Object.entries(w.scales || {})
    .map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`)
    .join(', ');
  const reqs = w.reqs ? `Realm ${w.reqs.realmMin}, Proficiency ${w.reqs.proficiencyMin}` : 'None';
  return `${w.displayName}\nBase: ${base}\nScales: ${scales}\nTags: ${(w.tags || []).join(', ')}\nReqs: ${reqs}`;
}

function showDetails(item) {
  if (item.type === 'weapon') {
    const text = weaponDetailsText(item);
    if (text) window.alert(text);
  } else {
    window.alert(item.key);
  }
}

function createInventoryRow(item) {
  const row = document.createElement('div');
  row.className = 'inventory-row';
  row.innerHTML = `<span class="inv-name">${item.key}</span> <span class="inv-qty">${item.qty || 1}</span>`;
  const act = document.createElement('div');
  act.className = 'inv-actions';
  const equipBtn = document.createElement('button');
  equipBtn.className = 'btn small';
  equipBtn.textContent = 'Equip';
  equipBtn.onclick = () => { equipItem(item); slotFilter = null; renderEquipmentPanel(); };
  act.appendChild(equipBtn);
  const useBtn = document.createElement('button');
  useBtn.className = 'btn small';
  useBtn.textContent = item.type === 'food' ? 'Eat' : 'Use';
  useBtn.onclick = () => {
    if (item.type === 'food') {
      const heal = item.key === 'cookedMeat' ? 40 : 20;
      S.hp = Math.min(S.hpMax, (S.hp || 0) + heal);
      item.qty = (item.qty || 1) - 1;
      if (item.qty <= 0) removeFromInventory(item.id);
    }
    renderEquipmentPanel();
  };
  act.appendChild(useBtn);
  const scrapBtn = document.createElement('button');
  scrapBtn.className = 'btn small warn';
  scrapBtn.textContent = 'Scrap';
  scrapBtn.onclick = () => {
    if (item.type === 'weapon') {
      S.ore = (S.ore || 0) + 1;
      save?.();
    }
    removeFromInventory(item.id);
    renderEquipmentPanel();
  };
  act.appendChild(scrapBtn);
  const detailsBtn = document.createElement('button');
  detailsBtn.className = 'btn small';
  detailsBtn.textContent = 'Details';
  detailsBtn.onclick = () => showDetails(item);
  act.appendChild(detailsBtn);
  row.appendChild(act);
  if (slotFilter && !canEquipToSlot(item, slotFilter)) row.classList.add('muted');
  return row;
}

function canEquipToSlot(item, slot) {
  switch (slot) {
    case 'mainhand': return item.type === 'weapon';
    case 'head':
    case 'torso': return item.type === 'armor' && item.slot === slot;
    case 'food': return item.type === 'food';
  }
  return false;
}

function renderInventory() {
  const list = document.getElementById('inventoryList');
  if (!list) return;
  list.innerHTML = '';
  const items = (S.inventory || []).filter(it => currentFilter === 'all' || it.type === currentFilter);
  items.forEach(it => list.appendChild(createInventoryRow(it)));
  const filterBtns = document.querySelectorAll('#inventoryFilters button');
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    btn.onclick = () => { currentFilter = btn.dataset.filter; slotFilter = null; renderInventory(); };
  });
}

export function setupEquipmentTab() {
  renderEquipmentPanel();
}
