import { S } from '../../game/state.js';
import { WEAPONS } from '../../data/weapons.js';
import { equipItem, unequip, removeFromInventory } from '../../game/systems/inventory.js';

// EQUIP-CHAR-UI: render character equipment and inventory
let currentFilter = 'all';
let slotFilter = null;

export function renderCharacterPanel() {
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
    el.querySelector('.unequip-btn').onclick = () => { unequip(s.key); renderCharacterPanel(); };
  });
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
  equipBtn.onclick = () => { equipItem(item); slotFilter = null; renderCharacterPanel(); };
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
    renderCharacterPanel();
  };
  act.appendChild(useBtn);
  const scrapBtn = document.createElement('button');
  scrapBtn.className = 'btn small warn';
  scrapBtn.textContent = 'Scrap';
  scrapBtn.onclick = () => { removeFromInventory(item.id); renderCharacterPanel(); };
  act.appendChild(scrapBtn);
  const detailsBtn = document.createElement('button');
  detailsBtn.className = 'btn small';
  detailsBtn.textContent = 'Details';
  detailsBtn.onclick = () => alert(item.key);
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

export function setupCharacterTab() {
  renderCharacterPanel();
}
