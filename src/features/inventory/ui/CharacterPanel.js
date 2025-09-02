import { S, save } from '../../../shared/state.js';
import { WEAPONS } from '../../weaponGeneration/data/weapons.js';
import { WEAPON_ICONS } from '../../weaponGeneration/data/weaponIcons.js';
import { equipItem, unequip, removeFromInventory, moveToJunk } from '../mutators.js';
import { recomputePlayerTotals } from '../logic.js';
import { ABILITIES } from '../../ability/data/abilities.js';
import { MODIFIERS } from '../../gearGeneration/data/modifiers.js';

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

const ELEMENT_TEXT_COLORS = {
  physical: '#ffffff',
  metal: '#999999',
  earth: '#b58b00',
  wood: '#2e8b57',
  water: '#1e90ff',
  fire: '#ff4500',
};

const ELEMENT_GLYPHS = {
  metal: '⚙',
  earth: '🗿',
  wood: '🌿',
  water: '💧',
  fire: '🔥',
  none: '◯',
};

const QUALITY_STARS = {
  basic: '',
  refined: '★',
  superior: '★★'
};

const RARITY_COLORS = {
  magic: '#3b82f6',
  rare: '#fbbf24',
};

function getElementGlyph(element){
  return ELEMENT_GLYPHS[element] || ELEMENT_GLYPHS.none;
}

function formatStats(stats){
  if (!stats) return [];
  return Object.entries(stats).map(([k,v]) => {
    switch(k){
      case 'stunBuildMult': return `Stun Build +${Math.round(v*100)}%`;
      case 'stunDurationMult': return `Stun Duration +${Math.round(v*100)}%`;
      default: return `${k}: ${v}`;
    }
  });
}

function formatDamage(base){
  if (!base) return '';
  const parts = [];
  if (base.phys){
    parts.push(`<span style="color:${ELEMENT_TEXT_COLORS.physical}">${base.phys.min}-${base.phys.max}</span>`);
  }
  Object.entries(base.elems || {}).forEach(([el,val]) => {
    parts.push(`<span style="color:${ELEMENT_TEXT_COLORS[el] || '#fff'}">${val.min}-${val.max}</span>`);
  });
  return parts.join(' + ');
}

function avgDamage(base){
  if (!base) return 0;
  let total = 0;
  if (base.phys) total += (base.phys.min + base.phys.max)/2;
  Object.values(base.elems || {}).forEach(v => { total += (v.min + v.max)/2; });
  return total;
}

function weaponTooltipHtml(item){
  const w = WEAPONS[item.key] || item;
  if (!w) return '';
  const iconKey = w.proficiencyKey;
  const icon = iconKey ? WEAPON_ICONS[iconKey] : null;
  const stars = QUALITY_STARS[item.quality || w.quality] || '';
  const rarityColor = RARITY_COLORS[w.rarity] || '';
  const headerIcon = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon>` : '';
  const header = `<div class="tooltip-header">${headerIcon}<span class="tooltip-name" style="color:${rarityColor}">${w.displayName || w.name}</span>${stars ? `<span class="quality-stars">${stars}</span>` : ''}</div>`;
  const rate = w.base?.attackRate ?? w.base?.rate ?? 1;
  const dmgText = formatDamage(w.base);
  const dps = (avgDamage(w.base) * rate).toFixed(1);
  const core = `<div class="core-stats">
      <div class="stat-row dps"><span class="stat-label"><span class="stat-icon">✨</span>DPS</span><span class="stat-value">${dps}</span></div>
      <div class="core-line"><span class="stat-label"><span class="stat-icon">⚔</span>Damage</span><span class="stat-value">${dmgText}</span><span class="stat-label"><span class="stat-icon">⏱</span>Speed</span><span class="stat-value">${rate}/s</span></div>
    </div>`;
  const imbElem = item.imbuement?.element;
  const imbTier = item.imbuement?.tier || 0;
  const imbGlyph = getElementGlyph(imbElem);
  const imbColor = ELEMENT_TEXT_COLORS[imbElem] || '#fff';
  const imbue = `<div class="imbue-row"><span class="stat-label">Imbue:</span><span class="imbue-icon" style="color:${imbColor}">${imbGlyph}</span> — T${imbTier}</div>`;
  const implicit = formatStats(w.stats);
  const modDescs = (item.modifiers || w.modifiers || []).map(k => MODIFIERS[k]?.desc || k);
  const modsBlock = (implicit.length || modDescs.length) ? `<div class="mods-block">${implicit.map(m => `<div class="implicit-mod">${m}</div>`).join('')}${modDescs.length ? `<div class="mods-list">${modDescs.map(m => `<span class="mod-chip">${m}</span>`).join('')}</div>` : ''}</div>` : '';
  const reqs = w.reqs || { realmMin:0, proficiencyMin:0 };
  const tags = w.tags || [];
  const footer = `<div class="tooltip-footer"><div>Req: Realm ${reqs.realmMin || 0} • Prof ${reqs.proficiencyMin || 0}</div><div>Tags: ${tags.join(', ') || 'none'}</div></div>`;
  return header + core + imbue + modsBlock + footer;
}

function gearTooltipHtml(item){
  const stars = QUALITY_STARS[item.quality] || '';
  const rarityColor = RARITY_COLORS[item.rarity] || '';
  const header = `<div class="tooltip-header"><span class="tooltip-name" style="color:${rarityColor}">${item.name || item.key}</span>${stars ? `<span class="quality-stars">${stars}</span>` : ''}</div>`;
  const rows = [];
  if (item.protection?.armor) rows.push(`<div class="stat-row"><span class="stat-label">Armor</span><span class="stat-value">${item.protection.armor}</span></div>`);
  if (item.protection?.dodge) rows.push(`<div class="stat-row"><span class="stat-label">Dodge</span><span class="stat-value">${item.protection.dodge}</span></div>`);
  if (item.protection?.qiShield) rows.push(`<div class="stat-row"><span class="stat-label">Qi Shield</span><span class="stat-value">${item.protection.qiShield}</span></div>`);
  if (item.offense?.accuracy) rows.push(`<div class="stat-row"><span class="stat-label">Accuracy</span><span class="stat-value">${item.offense.accuracy}</span></div>`);
  const core = rows.length ? `<div class="core-stats">${rows.join('')}</div>` : '';
  const imbElem = item.imbuement?.element;
  const imbTier = item.imbuement?.tier || 0;
  const imbGlyph = getElementGlyph(imbElem);
  const imbColor = ELEMENT_TEXT_COLORS[imbElem] || '#fff';
  const imbue = `<div class="imbue-row"><span class="stat-label">Imbue:</span><span class="imbue-icon" style="color:${imbColor}">${imbGlyph}</span> — T${imbTier}</div>`;
  const modDescs = (item.modifiers || []).map(k => MODIFIERS[k]?.desc || k);
  const modsBlock = modDescs.length ? `<div class="mods-block"><div class="mods-list">${modDescs.map(m => `<span class="mod-chip">${m}</span>`).join('')}</div></div>` : '';
  const footerParts = [];
  if (item.reqs) footerParts.push(`Req: Realm ${item.reqs.realmMin} • Prof ${item.reqs.proficiencyMin}`);
  if (item.tags?.length) footerParts.push(`Tags: ${item.tags.join(', ')}`);
  const footer = footerParts.length ? `<div class="tooltip-footer">${footerParts.map(t => `<div>${t}</div>`).join('')}</div>` : '';
  return header + core + imbue + modsBlock + footer;
}

export function renderEquipmentPanel() {
  recomputePlayerTotals(S);
  renderEquipment();
  renderInventory();
  renderMaterials();
  renderJunk();
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
    { id: 'adventureSpeed', stat: 'adventureSpeed', format: v => v.toFixed(2) },
    { id: 'coin', value: () => S.coin || 0 }
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
    const rarity = item?.rarity;
    const rarityColor = RARITY_COLORS[rarity] || '';
    const rarityPrefix = rarity && rarity !== 'normal' ? `${rarity[0].toUpperCase()}${rarity.slice(1)} ` : '';
    const displayName = rarityPrefix + name;
    const baseNameHtml = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ${displayName}` : displayName;
    const coloredNameHtml = rarityColor ? `<span style="color:${rarityColor}">${baseNameHtml}</span>` : baseNameHtml;
    const nameHtml = stars ? `${stars} ${coloredNameHtml}` : coloredNameHtml;
    el.querySelector('.slot-name').innerHTML = nameHtml;
    el.querySelector('.equip-btn').onclick = () => { slotFilter = s.key; renderInventory({ dismissTooltip: true }); };
    el.querySelector('.unequip-btn').onclick = () => { unequip(s.key); renderEquipmentPanel(); };
    const element = item?.element || item?.imbuement?.element;
    el.style.backgroundColor = element ? (ELEMENT_BG_COLORS[element] || '') : '';
  });
  const armorEl = document.getElementById('armorVal');
  if (armorEl) armorEl.textContent = S.stats?.armor || 0;
  const accEl = document.getElementById('accuracyVal');
  if (accEl) accEl.textContent = S.stats?.accuracy || 0;
  const dodgeEl = document.getElementById('dodgeVal');
  if (dodgeEl) dodgeEl.textContent = S.stats?.dodge || 0;
let currentTooltip = null;

function hideItemTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

function showItemTooltip(anchor, html) {
  hideItemTooltip();
  const tooltip = document.createElement('div');
  tooltip.className = 'astral-tooltip item-tooltip';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'tooltip-close';
  closeBtn.textContent = '✖';
  closeBtn.onclick = hideItemTooltip;
  tooltip.appendChild(closeBtn);

  const content = document.createElement('div');
  content.innerHTML = html;
  tooltip.appendChild(content);

  document.body.appendChild(tooltip);
  const rect = anchor.getBoundingClientRect();
  const tRect = tooltip.getBoundingClientRect();
  let left = rect.right + 8;
  let top = rect.top + rect.height / 2 - tRect.height / 2;
  if (left + tRect.width > window.innerWidth - 8) left = rect.left - tRect.width - 8;
  if (left < 8) left = 8;
  if (top < 8) top = 8;
  if (top + tRect.height > window.innerHeight - 8) top = window.innerHeight - tRect.height - 8;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  currentTooltip = tooltip;
}

function showDetails(item, evt) {
  let html = '';
  if (item.type === 'weapon') {
    html = weaponTooltipHtml(item);
  } else if (['armor', 'foot', 'ring', 'talisman'].includes(item.type)) {
    html = gearTooltipHtml(item);
  } else {
    html = `<div class="tooltip-header">${item.name || item.key}</div>`;
  }
  if (html && evt?.target) {
    evt.stopPropagation();
    showItemTooltip(evt.target, html);
  }
}

function createInventoryRow(item) {
  const row = document.createElement('div');
  row.className = 'inventory-row';
  const element = item.element || item.imbuement?.element;
  if (element) {
    row.style.backgroundColor = ELEMENT_BG_COLORS[element] || '';
  }
  const iconKey = item.type === 'weapon' ? WEAPONS[item.key]?.proficiencyKey : null;
  const icon = iconKey ? WEAPON_ICONS[iconKey] : null;
  const rarity = item.rarity;
  const rarityColor = RARITY_COLORS[rarity] || '';
  const rarityPrefix = rarity && rarity !== 'normal' ? `${rarity[0].toUpperCase()}${rarity.slice(1)} ` : '';
  const displayName = rarityPrefix + (item.name || item.key);
  const stars = QUALITY_STARS[item?.quality] || '';
  const baseNameHtml = icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon> ${displayName}` : displayName;
  const coloredNameHtml = rarityColor ? `<span style="color:${rarityColor}">${baseNameHtml}</span>` : baseNameHtml;
  const nameHtml = stars ? `${stars} ${coloredNameHtml}` : coloredNameHtml;
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
    const junkBtn = document.createElement('button');
    junkBtn.className = 'btn small';
    junkBtn.textContent = 'Junk';
    junkBtn.onclick = () => { moveToJunk(item.id); renderEquipmentPanel(); };
    act.appendChild(junkBtn);
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'btn small';
    detailsBtn.textContent = 'Details';
    detailsBtn.onclick = (e) => showDetails(item, e);
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

function renderInventory({ dismissTooltip = false } = {}) {
  if (dismissTooltip) hideItemTooltip();
  const list = document.getElementById('inventoryList');
  if (!list) return;
  list.innerHTML = '';
  const items = (S.inventory || []).filter(it => it.type !== 'material' && (currentFilter === 'all' || it.type === currentFilter));
  items.forEach(it => list.appendChild(createInventoryRow(it)));
  const filterBtns = document.querySelectorAll('#inventoryFilters button');
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    btn.onclick = () => { currentFilter = btn.dataset.filter; slotFilter = null; renderInventory({ dismissTooltip: true }); };
  });
}

function renderMaterials() {
  const list = document.getElementById('materialsList');
  if (!list) return;
  list.innerHTML = '';
  const mats = (S.inventory || []).filter(it => it.type === 'material');
  mats.forEach(it => {
    const row = createInventoryRow(it);
    row.classList.remove('muted');
    list.appendChild(row);
  });
}

function createJunkRow(item) {
  const row = createInventoryRow(item);
  row.classList.remove('muted');
  const act = row.querySelector('.inv-actions');
  if (act) {
    act.innerHTML = '';
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'btn small';
    detailsBtn.textContent = 'Details';
    detailsBtn.onclick = (e) => showDetails(item, e);
    act.appendChild(detailsBtn);
  }
  return row;
}

function renderJunk() {
  const list = document.getElementById('junkList');
  if (!list) return;
  list.innerHTML = '';
  const items = S.junk || [];
  items.forEach(it => list.appendChild(createJunkRow(it)));
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
