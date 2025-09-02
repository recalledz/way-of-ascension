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

const QUALITY_STARS = {
  basic: '',
  refined: '★',
  superior: '★★'
};

const RARITY_COLORS = {
  magic: '#3b82f6',
  rare: '#fbbf24',
};

const ELEMENT_TEXT_COLORS = {
  metal: '#999',
  earth: '#b58b00',
  wood: '#2e8b57',
  water: '#1e90ff',
  fire: '#ff4500',
  physical: '#fff'
};

const ELEMENT_ICONS = {
  metal: '⚙️',
  earth: '🪨',
  wood: '🌿',
  water: '💧',
  fire: '🔥',
  physical: '⚪'
};

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
}

function createWeaponTooltip(item) {
  const w = WEAPONS[item.key] || item;
  const content = document.createElement('div');
  content.className = 'item-tooltip-content';

  const header = document.createElement('div');
  header.className = 'item-header';
  const iconKey = w.proficiencyKey;
  const icon = iconKey ? WEAPON_ICONS[iconKey] : null;
  if (icon) {
    const iconEl = document.createElement('iconify-icon');
    iconEl.setAttribute('icon', icon);
    iconEl.className = 'item-icon';
    header.appendChild(iconEl);
  }
  const nameSpan = document.createElement('span');
  nameSpan.className = 'item-name';
  nameSpan.textContent = w.displayName || w.name;
  const rarityColor = RARITY_COLORS[w.rarity] || '';
  if (rarityColor) nameSpan.style.color = rarityColor;
  header.appendChild(nameSpan);
  const stars = QUALITY_STARS[w.quality] || '';
  if (stars) {
    const starSpan = document.createElement('span');
    starSpan.className = 'item-quality';
    starSpan.textContent = stars;
    header.appendChild(starSpan);
  }
  content.appendChild(header);

  const core = document.createElement('div');
  core.className = 'core-stats';
  const dmgMin = w.base?.phys?.min ?? 0;
  const dmgMax = w.base?.phys?.max ?? 0;
  const rate = w.base ? (w.base.attackRate ?? w.base.rate ?? 0) : 0;
  const dps = ((dmgMin + dmgMax) / 2) * rate;

  const dpsRow = document.createElement('div');
  dpsRow.className = 'core-row dps-row';
  const dpsLabel = document.createElement('span');
  dpsLabel.className = 'label';
  dpsLabel.textContent = '✨ DPS';
  dpsRow.appendChild(dpsLabel);
  const dpsVal = document.createElement('span');
  dpsVal.className = 'value';
  dpsVal.textContent = dps.toFixed(1);
  dpsRow.appendChild(dpsVal);
  core.appendChild(dpsRow);

  const dmgRow = document.createElement('div');
  dmgRow.className = 'core-row';
  const dmgLabel = document.createElement('span');
  dmgLabel.className = 'label';
  dmgLabel.textContent = '⚔ Damage';
  dmgRow.appendChild(dmgLabel);
  const dmgVal = document.createElement('span');
  dmgVal.className = 'value';
  const imbElem = item.imbuement?.element || 'physical';
  dmgVal.style.color = ELEMENT_TEXT_COLORS[imbElem] || ELEMENT_TEXT_COLORS.physical;
  dmgVal.textContent = `${dmgMin}–${dmgMax}`;
  dmgRow.appendChild(dmgVal);
  core.appendChild(dmgRow);

  const speedRow = document.createElement('div');
  speedRow.className = 'core-row';
  const speedLabel = document.createElement('span');
  speedLabel.className = 'label';
  speedLabel.textContent = '⏱ Speed';
  speedRow.appendChild(speedLabel);
  const speedVal = document.createElement('span');
  speedVal.className = 'value';
  speedVal.textContent = `${rate.toFixed(1)}/s`;
  speedRow.appendChild(speedVal);
  core.appendChild(speedRow);

  content.appendChild(core);

  const imbBlock = document.createElement('div');
  imbBlock.className = 'imbue-block';
  const imbIcon = document.createElement('span');
  imbIcon.textContent = ELEMENT_ICONS[imbElem] || ELEMENT_ICONS.physical;
  imbIcon.style.color = ELEMENT_TEXT_COLORS[imbElem] || ELEMENT_TEXT_COLORS.physical;
  imbBlock.appendChild(imbIcon);
  const imbText = document.createElement('span');
  imbText.textContent = `— T${item.imbuement?.tier || 0}`;
  imbBlock.appendChild(imbText);
  content.appendChild(imbBlock);

  const divider = document.createElement('div');
  divider.className = 'tooltip-divider';
  content.appendChild(divider);

  if (w.modifiers && w.modifiers.length) {
    const modBlock = document.createElement('div');
    modBlock.className = 'modifiers-block';
    w.modifiers.forEach(k => {
      const chip = document.createElement('span');
      chip.className = 'mod-chip';
      chip.textContent = MODIFIERS[k]?.desc || k;
      modBlock.appendChild(chip);
    });
    content.appendChild(modBlock);
  }

  const footer = document.createElement('div');
  footer.className = 'tooltip-footer';
  const reqs = w.reqs || { realmMin: 0, proficiencyMin: 0 };
  const reqDiv = document.createElement('div');
  reqDiv.textContent = `Req: Realm ${reqs.realmMin || 0} • Prof ${reqs.proficiencyMin || 0}`;
  footer.appendChild(reqDiv);
  if (w.tags && w.tags.length) {
    const tagDiv = document.createElement('div');
    tagDiv.textContent = `Tags: ${w.tags.join(', ')}`;
    footer.appendChild(tagDiv);
  }
  content.appendChild(footer);

  return content;
}

function createGearTooltip(item) {
  const content = document.createElement('div');
  content.className = 'item-tooltip-content';

  const header = document.createElement('div');
  header.className = 'item-header';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'item-name';
  nameSpan.textContent = item.name || item.key;
  const rarityColor = RARITY_COLORS[item.rarity] || '';
  if (rarityColor) nameSpan.style.color = rarityColor;
  header.appendChild(nameSpan);
  const stars = QUALITY_STARS[item.quality] || '';
  if (stars) {
    const starSpan = document.createElement('span');
    starSpan.className = 'item-quality';
    starSpan.textContent = stars;
    header.appendChild(starSpan);
  }
  content.appendChild(header);

  const core = document.createElement('div');
  core.className = 'core-stats';
  if (item.protection) {
    Object.entries(item.protection).forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'core-row';
      const label = document.createElement('span');
      label.className = 'label';
      const labelMap = { armor: 'Armor', dodge: 'Dodge', qiShield: 'Qi Shield' };
      label.textContent = labelMap[k] || k;
      row.appendChild(label);
      const val = document.createElement('span');
      val.className = 'value';
      val.textContent = v;
      row.appendChild(val);
      core.appendChild(row);
    });
  }
  if (item.offense) {
    Object.entries(item.offense).forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'core-row';
      const label = document.createElement('span');
      label.className = 'label';
      const labelMap = { accuracy: 'Accuracy' };
      label.textContent = labelMap[k] || k;
      row.appendChild(label);
      const val = document.createElement('span');
      val.className = 'value';
      val.textContent = v;
      row.appendChild(val);
      core.appendChild(row);
    });
  }
  if (core.childElementCount) content.appendChild(core);

  const imbBlock = document.createElement('div');
  imbBlock.className = 'imbue-block';
  const imbElem = item.imbuement?.element || 'physical';
  const imbIcon = document.createElement('span');
  imbIcon.textContent = ELEMENT_ICONS[imbElem] || ELEMENT_ICONS.physical;
  imbIcon.style.color = ELEMENT_TEXT_COLORS[imbElem] || ELEMENT_TEXT_COLORS.physical;
  imbBlock.appendChild(imbIcon);
  const imbText = document.createElement('span');
  imbText.textContent = `— T${item.imbuement?.tier || 0}`;
  imbBlock.appendChild(imbText);
  content.appendChild(imbBlock);

  const divider = document.createElement('div');
  divider.className = 'tooltip-divider';
  content.appendChild(divider);

  if ((item.modifiers && item.modifiers.length) || item.bonuses) {
    const modBlock = document.createElement('div');
    modBlock.className = 'modifiers-block';
    if (item.modifiers) {
      item.modifiers.forEach(k => {
        const chip = document.createElement('span');
        chip.className = 'mod-chip';
        chip.textContent = MODIFIERS[k]?.desc || k;
        modBlock.appendChild(chip);
      });
    }
    if (item.bonuses) {
      Object.entries(item.bonuses).forEach(([k, v]) => {
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
          case 'dropRateMult':
            label = 'Drop Rate';
            break;
        }
        const chip = document.createElement('span');
        chip.className = 'mod-chip';
        chip.textContent = `${label} +${(v * 100).toFixed(0)}%`;
        modBlock.appendChild(chip);
      });
    }
    content.appendChild(modBlock);
  }

  const footer = document.createElement('div');
  footer.className = 'tooltip-footer';
  const reqs = item.reqs || { realmMin: 0, proficiencyMin: 0 };
  const reqDiv = document.createElement('div');
  reqDiv.textContent = `Req: Realm ${reqs.realmMin || 0} • Prof ${reqs.proficiencyMin || 0}`;
  footer.appendChild(reqDiv);
  if (item.tags && item.tags.length) {
    const tagDiv = document.createElement('div');
    tagDiv.textContent = `Tags: ${item.tags.join(', ')}`;
    footer.appendChild(tagDiv);
  }
  content.appendChild(footer);

  return content;
}

let currentTooltip = null;

function hideItemTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

function showItemTooltip(anchor, content) {
  hideItemTooltip();
  const tooltip = document.createElement('div');
  tooltip.className = 'astral-tooltip item-tooltip';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'tooltip-close';
  closeBtn.textContent = '✖';
  closeBtn.onclick = hideItemTooltip;
  tooltip.appendChild(closeBtn);

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
  let content = null;
  if (item.type === 'weapon') {
    content = createWeaponTooltip(item);
  } else if (['armor', 'foot', 'ring', 'talisman'].includes(item.type)) {
    content = createGearTooltip(item);
  } else {
    const div = document.createElement('div');
    div.textContent = item.name || item.key;
    content = div;
  }
  if (content && evt?.target) {
    evt.stopPropagation();
    showItemTooltip(evt.target, content);
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
