import { S, save } from '../../../shared/state.js';
import { WEAPONS } from '../../weaponGeneration/data/weapons.js';
import { WEAPON_ICONS } from '../../weaponGeneration/data/weaponIcons.js';
import { equipItem, unequip, removeFromInventory } from '../mutators.js';
import { recomputePlayerTotals } from '../logic.js';
import { ABILITIES } from '../../ability/data/abilities.js';

// Consolidated equipment/inventory panel
let currentFilter = 'all';
let slotFilter = null;

const ELEMENT_BG_COLORS = {
  metal: 'rgba(153, 153, 153, 0.2)',
  earth: 'rgba(181, 139, 0, 0.2)',
  wood: 'rgba(46, 139, 87, 0.2)',
  water: 'rgba(30, 144, 255, 0.2)',
  fire: 'rgba(255, 69, 0, 0.2)'
};

const QUALITY_STARS = {
  basic: '',
  refined: '★',
  superior: '★★'
};

export function renderEquipmentPanel() {
  recomputePlayerTotals(S);
  renderEquipment();
  renderInventory();
  renderStats();
  renderAbilitySlots();
}

function renderStats() {
  if (!S.stats) return;
  const defs = [
    { id: 'hp', value: () => `${S.hp}/${S.hpMax}` },
    { id: 'shield', value: () => `${S.shield?.current || 0}/${S.shield?.max || 0}` },
    { id: 'atkBase', value: () => S.atkBase },
    { id: 'armorBase', value: () => S.armorBase },
    { id: 'armor', stat: 'armor' },
    { id: 'physique', stat: 'physique' },
    { id: 'mind', stat: 'mind' },
    { id: 'agility', stat: 'agility' },
    { id: 'dexterity', stat: 'dexterity' },
    { id: 'comprehension', stat: 'comprehension' },
    { id: 'accuracy', stat: 'accuracy' },
    { id: 'dodge', stat: 'dodge' },
    { id: 'criticalChance', stat: 'criticalChance', format: v => `${(v * 100).toFixed(1)}%` },
    { id: 'attackSpeed', stat: 'attackSpeed', format: v => v.toFixed(2) },
    { id: 'cooldownReduction', stat: 'cooldownReduction', format: v => `${Math.round(v * 100)}%` },
    { id: 'adventureSpeed', stat: 'adventureSpeed', format: v => v.toFixed(2) }
  ];
  defs.forEach(d => {
    const el = document.getElementById(`stat-${d.id}`);
    if (!el) return;
    const val = d.value ? d.value() : (S.stats[d.stat] ?? 0);
    el.textContent = d.format ? d.format(val) : val;
  });
}

function renderEquipment() {
  const slots = [
    { key: 'mainhand', label: 'Weapon' },
    { key: 'head', label: 'Head' },
    { key: 'body', label: 'Body' },
    { key: 'foot', label: 'Feet' },
    { key: 'ring1', label: 'Ring 1' },
    { key: 'ring2', label: 'Ring 2' },
    { key: 'talisman1', label: 'Talisman 1' },
    { key: 'talisman2', label: 'Talisman 2' },
    { key: 'food', label: 'Food' }
  ];
  slots.forEach(s => {
    const el = document.getElementById(`slot-${s.key}`);
    if (!el) return;
    const item = S.equipment[s.key];
    const name = item?.name || (item?.key ? (WEAPONS[item.key]?.displayName || item.key) : 'Empty');
    const iconKey = item?.key ? WEAPONS[item.key]?.proficiencyKey : null;
    const icon = iconKey ? WEAPON_ICONS[iconKey] : null;
    const stars = QUALITY_STARS[item?.quality] || '';
    const baseNameHtml = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ${name}` : name;
    const nameHtml = stars ? `${stars} ${baseNameHtml}` : baseNameHtml;
    el.querySelector('.slot-name').innerHTML = nameHtml;
    el.querySelector('.equip-btn').onclick = () => { slotFilter = s.key; renderInventory(); };
    el.querySelector('.unequip-btn').onclick = () => { unequip(s.key); renderEquipmentPanel(); };
    if (item?.element) {
      el.style.backgroundColor = ELEMENT_BG_COLORS[item.element] || '';
    } else {
      el.style.backgroundColor = '';
    }
  });
  const armorEl = document.getElementById('armorVal');
  if (armorEl) armorEl.textContent = S.stats?.armor || 0;
  const accEl = document.getElementById('accuracyVal');
  if (accEl) accEl.textContent = S.stats?.accuracy || 0;
  const dodgeEl = document.getElementById('dodgeVal');
  if (dodgeEl) dodgeEl.textContent = S.stats?.dodge || 0;
}

function weaponDetailsText(item) {
  const w = WEAPONS[item.key] || item;
  if (!w) return '';
  const baseRate = w.base ? (w.base.attackRate ?? w.base.rate) : null;
  const base = w.base ? `${w.base.min}-${w.base.max} (${baseRate}/s)` : 'n/a';
  const scales = Object.entries(w.scales || {})
    .map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`)
    .join(', ');
  const reqs = w.reqs ? `Realm ${w.reqs.realmMin}, Proficiency ${w.reqs.proficiencyMin}` : 'None';
  const quality = w.quality ?? 'basic';
  const affixes = w.affixes && w.affixes.length ? w.affixes.join(', ') : 'None';
  return `${w.displayName || w.name}\nQuality: ${quality}\nAffixes: ${affixes}\nBase: ${base}\nScales: ${scales}\nTags: ${(w.tags || []).join(', ')}\nReqs: ${reqs}`;
}

function gearDetailsText(item) {
  const lines = [item.name || item.key];
  if (item.quality) lines.push(`Quality: ${item.quality}`);
  if (item.guardType) lines.push(`Guard: ${item.guardType}`);
  if (item.element) lines.push(`Element: ${item.element}`);
  if (item.protection) {
    const prot = [];
    if (item.protection.armor) prot.push(`Armor ${item.protection.armor}`);
    if (item.protection.dodge) prot.push(`Dodge ${item.protection.dodge}`);
    if (item.protection.qiShield) prot.push(`Qi Shield ${item.protection.qiShield}`);
    if (prot.length) lines.push(`Protection: ${prot.join(', ')}`);
  }
  if (item.offense) {
    const off = [];
    if (item.offense.accuracy) off.push(`Accuracy ${item.offense.accuracy}`);
    if (off.length) lines.push(`Offense: ${off.join(', ')}`);
  }
  if (item.bonuses) {
    const bonusLines = Object.entries(item.bonuses).map(([k, v]) => {
      let label = k;
      switch (k) {
        case 'foundationMult':
          label = 'Foundation';
          break;
        case 'breakthroughBonus':
          label = 'Breakthrough';
          break;
        case 'qiRegenMult':
          label = 'Qi Regen';
          break;
      }
      return `${label}: +${(v * 100).toFixed(0)}%`;
    });
    lines.push(...bonusLines);
  }
  return lines.join('\n');
}

function showDetails(item) {
  if (item.type === 'weapon') {
    const text = weaponDetailsText(item);
    if (text) window.alert(text);
  } else if (['armor', 'foot', 'ring', 'talisman'].includes(item.type)) {
    const text = gearDetailsText(item);
    if (text) window.alert(text);
  } else {
    window.alert(item.name || item.key);
  }
}

function createInventoryRow(item) {
  const row = document.createElement('div');
  row.className = 'inventory-row';
  if (item.element) {
    row.style.backgroundColor = ELEMENT_BG_COLORS[item.element] || '';
  }
  const iconKey = item.type === 'weapon' ? WEAPONS[item.key]?.proficiencyKey : null;
  const icon = iconKey ? WEAPON_ICONS[iconKey] : null;
  const displayName = item.name || item.key;
  const stars = QUALITY_STARS[item?.quality] || '';
  const baseNameHtml = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ${displayName}` : displayName;
  const nameHtml = stars ? `${stars} ${baseNameHtml}` : baseNameHtml;
  row.innerHTML = `<span class="inv-name">${nameHtml}</span> <span class="inv-qty">${item.qty || 1}</span>`;
  const act = document.createElement('div');
  act.className = 'inv-actions';
  if (['weapon', 'armor', 'food', 'foot', 'ring', 'talisman'].includes(item.type)) {
    const equipBtn = document.createElement('button');
    equipBtn.className = 'btn small';
    equipBtn.textContent = 'Equip';
    equipBtn.onclick = () => { equipItem(item, slotFilter); slotFilter = null; renderEquipmentPanel(); };
    act.appendChild(equipBtn);
    if (item.type === 'food') {
      const useBtn = document.createElement('button');
      useBtn.className = 'btn small';
      useBtn.textContent = 'Eat';
      useBtn.onclick = () => {
        const heal = item.key === 'cookedMeat' ? 40 : 20;
        S.hp = Math.min(S.hpMax, (S.hp || 0) + heal);
        item.qty = (item.qty || 1) - 1;
        if (item.qty <= 0) removeFromInventory(item.id);
        renderEquipmentPanel();
      };
      act.appendChild(useBtn);
    }
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
  }
  row.appendChild(act);
  if (slotFilter && !canEquipToSlot(item, slotFilter)) row.classList.add('muted');
  return row;
}

function canEquipToSlot(item, slot) {
  switch (slot) {
    case 'mainhand': return item.type === 'weapon';
    case 'head':
    case 'body': return item.type === 'armor' && item.slot === slot;
    case 'foot': return item.type === 'foot';
    case 'ring1':
    case 'ring2': return item.type === 'ring';
    case 'talisman1':
    case 'talisman2': return item.type === 'talisman';
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
  setupGearTabs();
}

function setupGearTabs() {
  const tabButtons = document.querySelectorAll('.gear-tab-btn');
  tabButtons.forEach(button => {
    button.onclick = () => {
      const tabName = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.gear-tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      button.classList.add('active');
      const content = document.getElementById(tabName + 'SubTab');
      if (content) {
        content.classList.add('active');
        content.style.display = 'block';
        if (tabName === 'gearAbilities') renderAbilitySlots();
      }
    };
  });
}

function renderAbilitySlots() {
  const slotsEl = document.getElementById('abilitySlots');
  const availEl = document.getElementById('availableAbilities');
  if (!slotsEl || !availEl) return;

  const limit = S.abilitySlotLimit || 0;
  const slotted = S.manualAbilityKeys || [];

  slotsEl.innerHTML = '';
  for (let i = 0; i < limit; i++) {
    const key = slotted[i];
    const row = document.createElement('div');
    row.className = 'ability-slot';
    if (key) {
      const def = ABILITIES[key];
      row.innerHTML = `<span class="slot-label">${def?.displayName || key}</span> <button class="btn small remove-btn" data-index="${i}">Remove</button>`;
    } else {
      row.innerHTML = `<span class="slot-label">Empty</span>`;
    }
    slotsEl.appendChild(row);
  }

  slotsEl.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index, 10);
      S.manualAbilityKeys.splice(idx, 1);
      save?.();
      renderAbilitySlots();
    };
  });

  availEl.innerHTML = '';
  const available = (S.availableAbilityKeys || []).filter(k => !slotted.includes(k));
  available.forEach(key => {
    const def = ABILITIES[key];
    const row = document.createElement('div');
    row.className = 'available-ability';
    row.innerHTML = `<span class="ability-name">${def?.displayName || key}</span> <button class="btn small slot-btn" data-key="${key}">Slot</button>`;
    availEl.appendChild(row);
  });

  availEl.querySelectorAll('.slot-btn').forEach(btn => {
    btn.onclick = () => {
      if (S.manualAbilityKeys.length >= limit) return;
      S.manualAbilityKeys.push(btn.dataset.key);
      save?.();
      renderAbilitySlots();
    };
  });
}
