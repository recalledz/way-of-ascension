import { S, save } from '../../../shared/state.js';
import { WEAPON_ICONS } from '../../weaponGeneration/data/weaponIcons.js';
import { equipItem, unequip, removeFromInventory, moveToJunk } from '../mutators.js';
import { recomputePlayerTotals } from '../logic.js';
import { ABILITIES } from '../../ability/data/abilities.js';
import { MODIFIERS } from '../../gearGeneration/data/modifiers.js';
import { GEAR_ICONS } from '../../gearGeneration/data/gearIcons.js';
import { usePill } from '../../alchemy/mutators.js';
import { ALCHEMY_RECIPES } from '../../alchemy/data/recipes.js';
import { PILL_LINES } from '../../alchemy/data/pills.js';
import { computePP } from '../../../engine/pp.js';
import { calculatePlayerAttackSnapshot } from '../../progression/selectors.js';

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

const SLOT_PLACEHOLDERS = {
  mainhand: WEAPON_ICONS.sword,
  head: GEAR_ICONS.head,
  body: GEAR_ICONS.body,
  foot: GEAR_ICONS.foot,
  ring1: GEAR_ICONS.ring,
  ring2: GEAR_ICONS.ring,
  talisman1: GEAR_ICONS.talisman,
  talisman2: GEAR_ICONS.talisman,
  food1: GEAR_ICONS.food,
  food2: GEAR_ICONS.food,
  food3: GEAR_ICONS.food,
  food4: GEAR_ICONS.food,
  food5: GEAR_ICONS.food,
};

const ELEMENT_ICONS = {
  physical: '⚪',
  metal: '⚙',
  earth: '⛰',
  wood: '🌿',
  water: '💧',
  fire: '🔥'
};

const ELEMENT_COLORS = {
  physical: '#ffffff',
  metal: '#999999',
  earth: '#b58b00',
  wood: '#2e8b57',
  water: '#1e90ff',
  fire: '#ff4500'
};

const IMPLICIT_STAT_LABELS = {
  accuracy: 'Accuracy',
  criticalChance: 'Critical Chance',
  attackSpeed: 'Attack Speed',
  stunBuildMult: 'Stun Strength',
  stunDurationMult: 'Stun Duration',
  mind: 'Mind',
  qiCostPct: 'Qi Cost Reduction',
  qiConversionPct: 'Qi Conversion',
  comboDamagePct: 'Combo Multiplier',
  ailmentChancePct: 'Ailment Chance',
  repeatBasicChancePct: 'Repeat Attack Chance',
  damageTransferPct: 'Damage Transfer',
  physDamagePct: 'Physical Damage',
};

const STAT_INFO = {
  hp: {
    name: 'HP',
    desc: 'Hit points. You die when this reaches 0.',
    calc: '100 base + Physique × 3 + bonuses from gear and effects',
  },
  shield: {
    name: 'Shield',
    desc: 'Qi shield that absorbs damage before HP.',
    calc: 'Base 0 scaled by Mind and other bonuses',
  },
  attack: {
    name: 'Attack',
    desc: 'Average damage dealt per hit.',
    calc: 'Weapon damage plus bonuses from attributes, gear, proficiency and effects',
  },
  armorEquip: {
    name: 'Equipment Armor',
    desc: 'Armor provided by equipped gear.',
    calc: 'Sum of armor values from gear',
  },
  armor: {
    name: 'Armor',
    desc: 'Reduces physical damage taken.',
    calc: 'Equipment armor + temporary bonuses + karma, modified by laws and astral tree',
  },
  accuracy: {
    name: 'Accuracy',
    desc: 'Chance to hit enemies.',
    calc: 'Base accuracy plus gear bonuses',
  },
  dodge: {
    name: 'Dodge',
    desc: 'Chance to avoid enemy attacks.',
    calc: 'Base dodge plus bonuses from Agility and gear',
  },
  physique: {
    name: 'Physique',
    desc: 'Increases HP and carry capacity.',
    calc: '+3 HP and +1 carry capacity per level',
  },
  mind: {
    name: 'Mind',
    desc: 'Boosts Qi shield efficiency and learning.',
    calc: '+1% shield refill efficiency and +6% shield capacity per level',
  },
  agility: {
    name: 'Agility',
    desc: 'Improves dodge chance.',
    calc: '+2% dodge chance per level',
  },
  comprehension: {
    name: 'Comprehension',
    desc: 'Increases learning speed and foundation gain.',
    calc: '+4% learning speed and +5% foundation gain per point above 10',
  },
  criticalChance: {
    name: 'Crit Chance',
    desc: 'Chance for attacks to deal double damage.',
    calc: 'Base 5% plus bonuses from gear and effects',
  },
  attackSpeed: {
    name: 'Attack Speed',
    desc: 'Number of attacks per second.',
    calc: 'Weapon base rate modified by attack speed bonuses',
  },
  cooldownReduction: {
    name: 'Cooldown Reduction',
    desc: 'Reduces ability cooldowns.',
    calc: 'Base 0% plus bonuses from stats, gear and effects',
  },
  adventureSpeed: {
    name: 'Adventure Speed',
    desc: 'Speed of exploration.',
    calc: 'Base 1× modified by stats, gear and effects',
  },
  coin: {
    name: 'Coin',
    desc: 'Currency used for purchases.',
    calc: 'Earned from activities and defeated enemies',
  },
};

const EQUIP_SLOTS = [
  { key: 'mainhand', label: 'Weapon' },
  { key: 'head', label: 'Head' },
  { key: 'body', label: 'Body' },
  { key: 'foot', label: 'Feet' },
  { key: 'ring1', label: 'Ring 1' },
  { key: 'ring2', label: 'Ring 2' },
  { key: 'talisman1', label: 'Talisman 1' },
  { key: 'talisman2', label: 'Talisman 2' },
  { key: 'food1', label: 'Food 1' },
  { key: 'food2', label: 'Food 2' },
  { key: 'food3', label: 'Food 3' },
  { key: 'food4', label: 'Food 4' },
  { key: 'food5', label: 'Food 5' },
];

function computeItemPPDelta(item, state = S) {
  const slot = item.type === 'weapon' ? 'mainhand' : item.slot || item.type;
  if (!slot) return null;
  const temp = JSON.parse(JSON.stringify(state));
  recomputePlayerTotals(temp);
  const prev = computePP(temp);
  temp.equipment = temp.equipment || {};
  temp.equipment[slot] = { ...item };
  recomputePlayerTotals(temp);
  const next = computePP(temp);
  return {
    opp: next.opp - prev.opp,
    dpp: next.dpp - prev.dpp,
    pp: next.pp - prev.pp,
  };
}

function computePreviewSnapshot(item) {
  const slot = item.type === 'weapon' ? 'mainhand' : item.slot || item.type;
  if (!slot) return null;
  const temp = JSON.parse(JSON.stringify(S));
  temp.equipment = temp.equipment || {};
  temp.equipment[slot] = { ...item };
  recomputePlayerTotals(temp);
  return calculatePlayerAttackSnapshot(temp);
}

function ppDeltaHtml(item) {
  const delta = computeItemPPDelta(item);
  if (!delta) return '';
  const fmt = n => (n >= 0 ? '+' : '') + n.toFixed(2);
  return `<div class="pp-delta">PP Δ: ${fmt(delta.pp)} (O${fmt(delta.opp)} / D${fmt(delta.dpp)})</div>`;
}

function statTooltipHTML(info) {
  const lines = [];
  if (info.desc) lines.push(`<div class="stat-row">${info.desc}</div>`);
  if (info.calc) lines.push(`<div class="stat-row"><em>${info.calc}</em></div>`);
  return `<div class="tooltip-header"><span class="tooltip-name">${info.name}</span></div><div class="tooltip-core">${lines.join('')}</div>`;
}

export function renderEquipmentPanel() {
  recomputePlayerTotals(S);
  renderEquipment();
  renderSlotPPSummary();
  renderInventory();
  renderMaterials();
  renderJunk();
  renderStats();
  renderAbilitySlots();
}

function renderStats() {
  const stats = { ...S.attributes, ...S.derivedStats };
  if (!stats) return;
  const defs = [
    { id: 'hp', value: () => `${S.hp}/${S.hpMax}` },
    { id: 'shield', value: () => `${S.shield?.current || 0}/${S.shield?.max || 0}` },
    {
      id: 'attack',
      value: () => {
        const p = calculatePlayerAttackSnapshot(S).profile;
        return Math.round(p.phys + Object.values(p.elems).reduce((a, b) => a + b, 0));
      },
    },
    { id: 'armorEquip', value: () => S.gearStats?.armor || 0 },
    { id: 'armor', stat: 'armor' },
    { id: 'physique', stat: 'physique' },
    { id: 'mind', stat: 'mind' },
    { id: 'agility', stat: 'agility' },
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
    const val = d.value ? d.value() : (stats[d.stat] ?? 0);
    el.textContent = d.format ? d.format(val) : val;
    const row = el.parentElement;
    const info = STAT_INFO[d.id];
    if (row && info && !row.dataset.tooltipBound) {
      row.dataset.tooltipBound = '1';
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      row.style.cursor = 'pointer';
      row.onclick = () => showItemTooltip(row, statTooltipHTML(info));
      row.onkeydown = evt => {
        if (evt.key === 'Enter' || evt.key === ' ') {
          evt.preventDefault();
          row.click();
        }
      };
    }
  });
}

function renderEquipment() {
  EQUIP_SLOTS.forEach(s => {
    const el = document.getElementById(`slot-${s.key}`);
    if (!el) return;
    const item = S.equipment[s.key];
    el.innerHTML = '';
    el.onclick = () => { slotFilter = s.key; renderInventory({ dismissTooltip: true }); };
    el.onkeydown = evt => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        el.click();
      }
    };
    const placeholder = SLOT_PLACEHOLDERS[s.key];
    if (item) {
      el.classList.remove('empty');
      el.classList.add('equipped');
      const icon = item.type === 'weapon'
        ? WEAPON_ICONS[item.classKey]
        : GEAR_ICONS[item.slot || item.type];
      const iconEl = document.createElement('iconify-icon');
      iconEl.setAttribute('icon', icon || placeholder);
      iconEl.className = 'slot-icon';
      el.appendChild(iconEl);
      const rarityColor = RARITY_COLORS[item.rarity] || '';
      if (rarityColor) {
        const dot = document.createElement('span');
        dot.className = 'rarity-dot';
        dot.style.backgroundColor = rarityColor;
        el.appendChild(dot);
      }
      const unequipBtn = document.createElement('button');
      unequipBtn.className = 'unequip-chip';
      unequipBtn.textContent = '✕';
      unequipBtn.onclick = evt => { evt.stopPropagation(); unequip(s.key); renderEquipmentPanel(); };
      el.appendChild(unequipBtn);
      const infoBtn = document.createElement('button');
      infoBtn.className = 'slot-info';
      infoBtn.textContent = 'i';
      infoBtn.onclick = evt => { evt.stopPropagation(); showDetails(item, evt); };
      el.appendChild(infoBtn);
      if (s.key.startsWith('food') && item.qty > 1) {
        const badge = document.createElement('span');
        badge.className = 'count-badge';
        badge.textContent = item.qty;
        el.appendChild(badge);
      }
      const element = item.element || item.imbuement?.element;
      el.style.backgroundColor = element ? (ELEMENT_BG_COLORS[element] || '') : '';
      el.setAttribute('aria-label', `${s.label}: ${item.name || item.key} equipped`);
    } else {
      el.classList.remove('equipped');
      el.classList.add('empty');
      const iconEl = document.createElement('iconify-icon');
      iconEl.setAttribute('icon', placeholder);
      iconEl.className = 'slot-icon placeholder';
      el.appendChild(iconEl);
      const lbl = document.createElement('span');
      lbl.className = 'slot-empty-label';
      lbl.textContent = 'Empty';
      el.appendChild(lbl);
      el.style.backgroundColor = '';
      el.setAttribute('aria-label', `${s.label} empty`);
    }
  });
}

function renderSlotPPSummary() {
  const summaryEl = document.getElementById('ppSlotSummary');
  if (!summaryEl) return;
  const fmt = n => (n >= 0 ? '+' : '') + n.toFixed(2);
  const lines = [];
  EQUIP_SLOTS.forEach(s => {
    const item = S.equipment[s.key];
    if (!item) return;
    const base = JSON.parse(JSON.stringify(S));
    base.equipment = base.equipment || {};
    delete base.equipment[s.key];
    const delta = computeItemPPDelta(item, base);
    if (delta) {
      lines.push(`<div>${s.label}: ${fmt(delta.pp)} (O${fmt(delta.opp)} / D${fmt(delta.dpp)})</div>`);
    }
  });
  summaryEl.innerHTML = lines.join('');
}

function weaponDetailsHTML(item) {
  S.previewAttackSnapshot = computePreviewSnapshot(item);
  const w = item;
  if (!w) return '';
  const icon = w.classKey ? WEAPON_ICONS[w.classKey] : null;
  const stars = QUALITY_STARS[item.quality] || '';
  const rarityColor = RARITY_COLORS[item.rarity] || '';
  const name = w.name;
  const header = `<div class="tooltip-header">${icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon>` : ''}<span class="tooltip-name" style="color:${rarityColor}">${stars ? stars + ' ' : ''}${name}</span></div>`;
  const delta = ppDeltaHtml(item);

  const phys = w.base?.phys || { min: 0, max: 0 };
  const elems = w.base?.elems || {};
  const speed = w.base ? (w.base.attackRate ?? w.base.rate) : 0;
  const dmgParts = [];
  let avg = 0;
  if ((phys.min ?? 0) > 0 || (phys.max ?? 0) > 0) {
    dmgParts.push(`<span style="color:${ELEMENT_COLORS.physical}">${phys.min}–${phys.max}</span>`);
    avg += (phys.min + phys.max) / 2;
  }
  for (const [el, range] of Object.entries(elems)) {
    dmgParts.push(`<span style="color:${ELEMENT_COLORS[el] || ELEMENT_COLORS.physical}">${range.min}–${range.max}</span>`);
    avg += (range.min + range.max) / 2;
  }
  const dps = (avg * speed).toFixed(1);
  const dmgLine = dmgParts.join(', ');
  const core = `<div class="tooltip-core"><div class="dps-row"><span class="icon">🔥</span><span class="value">${dps}</span></div><div class="stat-row"><span class="label">⚔ Damage</span><span class="value">${dmgLine}</span></div><div class="stat-row"><span class="label">⏱ Speed</span><span class="value">${speed.toFixed(1)}/s</span></div></div>`;

  const imbEl = item.imbuement?.element || 'physical';
  const imbTier = item.imbuement?.tier ?? 0;
  const imbIcon = ELEMENT_ICONS[imbEl] || ELEMENT_ICONS.physical;
  const imbColor = ELEMENT_COLORS[imbEl] || ELEMENT_COLORS.physical;
  const imbue = `<div class="tooltip-imbue"><span class="element-icon" style="color:${imbColor}">${imbIcon}</span> — T${imbTier}</div>`;

  const pctStats = new Set(['criticalChance','attackSpeed','stunBuildMult','stunDurationMult','qiCostPct','qiConversionPct','comboDamagePct','ailmentChancePct','repeatBasicChancePct','damageTransferPct','physDamagePct']);
  const implicitLines = w.stats
    ? Object.entries(w.stats).map(([k,v]) => {
        const label = IMPLICIT_STAT_LABELS[k] || k;
        const val = pctStats.has(k) ? `${v >= 0 ? '+' : ''}${(v*100).toFixed(0)}%` : v;
        return `<div class="stat-row"><span class="label">${label}</span><span class="value">${val}</span></div>`;
      }).join('')
    : '';
  const implicitHtml = implicitLines ? `<div class="tooltip-implicit">${implicitLines}</div>` : '';

  const mods = (w.modifiers || []).map(k => MODIFIERS[k]?.desc || k);
  const modsHtml = mods.length ? `<div class="tooltip-mods">${mods.map(m => `<span class="mod-chip">${m}</span>`).join('')}</div>` : '';

  const reqRealm = w.reqs?.realmMin ?? 0;
  const reqProf = w.reqs?.proficiencyMin ?? 0;
  const tags = (w.tags || []).join(', ');
  const footer = `<div class="tooltip-footer"><div class="req">Req: Realm ${reqRealm} • Prof ${reqProf}</div>${tags ? `<div class="tags">Tags: ${tags}</div>` : ''}</div>`;

  return header + delta + core + imbue + implicitHtml + modsHtml + footer;
}

function gearDetailsHTML(item) {
  S.previewAttackSnapshot = computePreviewSnapshot(item);
  const stars = QUALITY_STARS[item.quality] || '';
  const rarityColor = RARITY_COLORS[item.rarity] || '';
  const name = item.name || item.key;
  const icon = GEAR_ICONS[item.slot || item.type];
  const header = `<div class="tooltip-header">${icon ? `<iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon>` : ''}<span class="tooltip-name" style="color:${rarityColor}">${stars ? stars + ' ' : ''}${name}</span></div>`;
  const delta = ppDeltaHtml(item);

  const coreLines = [];
  if (item.protection?.armor) coreLines.push({ label: 'Armor', value: item.protection.armor });
  if (item.protection?.dodge) coreLines.push({ label: 'Dodge', value: item.protection.dodge });
  if (item.protection?.qiShield) coreLines.push({ label: 'Qi Shield', value: item.protection.qiShield });
  if (item.offense?.accuracy) coreLines.push({ label: 'Accuracy', value: item.offense.accuracy });
  const core = coreLines.length ? `<div class="tooltip-core">${coreLines.map(l => `<div class="stat-row"><span class="label">${l.label}</span><span class="value">${l.value}</span></div>`).join('')}</div>` : '';

  const imbEl = item.imbuement?.element || 'physical';
  const imbTier = item.imbuement?.tier ?? 0;
  const imbIcon = ELEMENT_ICONS[imbEl] || ELEMENT_ICONS.physical;
  const imbColor = ELEMENT_COLORS[imbEl] || ELEMENT_COLORS.physical;
  const imbue = `<div class="tooltip-imbue"><span class="element-icon" style="color:${imbColor}">${imbIcon}</span> — T${imbTier}</div>`;

  const mods = (item.modifiers || []).map(k => MODIFIERS[k]?.desc || k);
  const modsHtml = mods.length ? `<div class="tooltip-mods">${mods.map(m => `<span class="mod-chip">${m}</span>`).join('')}</div>` : '';

  const tags = (item.tags || []).join(', ');
  const reqRealm = item.reqs?.realmMin ?? 0;
  const reqProf = item.reqs?.proficiencyMin ?? 0;
  const footer = `<div class="tooltip-footer"><div class="req">Req: Realm ${reqRealm} • Prof ${reqProf}</div>${tags ? `<div class="tags">Tags: ${tags}</div>` : ''}</div>`;

  return header + delta + core + imbue + modsHtml + footer;
}

function foodDetailsHTML(item) {
  const name = item.name || item.key;
  const heal = item.heal || 0;
  const header = `<div class="tooltip-header"><span class="tooltip-name">${name}</span></div>`;
  const core = `<div class="tooltip-core"><div class="stat-row"><span class="label">Heal</span><span class="value">${heal} HP</span></div></div>`;
  const footer = item.desc ? `<div class="tooltip-footer">${item.desc}</div>` : '';
  return header + core + footer;
}

function pillDetailsHTML(item) {
  const recipe = ALCHEMY_RECIPES[item.key];
  if (!recipe) return item.name || item.key;
  const eff = recipe.effects || {};
  let effect = '';
  if (eff.qiRestorePct) effect = `Restores ${eff.qiRestorePct}% Qi`;
  else if (eff.stats) {
    effect = Object.entries(eff.stats)
      .map(([stat, val]) => `+${val} ${stat}`)
      .join(', ');
  } else if (eff.status === 'pill_body_t1') effect = 'Boosts attack and armor for 30s';
  else if (eff.status === 'pill_breakthrough_t1') effect = '+10% breakthrough success for 60s';
  else if (eff.status === 'pill_meridian_opening_t1') effect = '+20% breakthrough chance for 30s';
  const header = `<div class="tooltip-header"><span class="tooltip-name">${recipe.name}</span></div>`;
  const core = effect ? `<div class="tooltip-core">${effect}</div>` : '';
  return header + core;
}

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
  tooltip.className = 'item-tooltip';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'tooltip-close';
  closeBtn.textContent = '✖';
  closeBtn.onclick = hideItemTooltip;
  tooltip.appendChild(closeBtn);

  const content = document.createElement('div');
  content.className = 'tooltip-content';
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
    html = weaponDetailsHTML(item);
  } else if (['armor', 'foot', 'ring', 'talisman'].includes(item.type)) {
    html = gearDetailsHTML(item);
  } else if (item.type === 'food') {
    html = foodDetailsHTML(item);
  } else if (item.type === 'pill') {
    html = pillDetailsHTML(item);
  } else {
    html = item.name || item.key;
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
  const icon = item.icon || (item.type === 'weapon'
    ? WEAPON_ICONS[item.classKey]
    : GEAR_ICONS[item.slot || item.type]);
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
        const heal = item.heal || 0;
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
  } else if (item.type === 'pill') {
    const useBtn = document.createElement('button');
    useBtn.className = 'btn small';
    useBtn.textContent = 'Use';
    useBtn.onclick = () => {
      const res = usePill(S, item.key, 1);
      if (res.ok) renderEquipmentPanel();
    };
    act.appendChild(useBtn);
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
    case 'food1':
    case 'food2':
    case 'food3':
    case 'food4':
    case 'food5':
      return item.type === 'food';
  }
  return false;
}

function renderInventory({ dismissTooltip = false } = {}) {
  if (dismissTooltip) hideItemTooltip();
  const list = document.getElementById('inventoryList');
  if (!list) return;
  list.innerHTML = '';
  const items = (S.inventory || []).filter(it => it.type !== 'material' && (currentFilter === 'all' || it.type === currentFilter));
  if (currentFilter === 'all' || currentFilter === 'pill') {
    Object.entries(S.pills || {}).forEach(([key, qty]) => {
      if (qty > 0) {
        items.push({
          id: `pill-${key}`,
          type: 'pill',
          key,
          name: PILL_LINES[key]?.name || key,
          qty,
        });
      }
    });
  }
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
        else if (tabName === 'gearStats') renderStats();
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
