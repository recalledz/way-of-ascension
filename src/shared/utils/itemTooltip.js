import { WEAPONS } from '../../features/weaponGeneration/data/weapons.js';
import { MODIFIERS } from '../../features/gearGeneration/data/modifiers.js';

let currentTooltip = null;
let currentTooltipListener = null;

export function hideItemTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
  if (currentTooltipListener) {
    document.removeEventListener('pointerdown', currentTooltipListener);
    currentTooltipListener = null;
  }
}

export function showItemTooltip(anchor, text) {
  hideItemTooltip();
  const tooltip = document.createElement('div');
  tooltip.className = 'astral-tooltip';
  tooltip.innerHTML = text.replace(/\n/g, '<br>');
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
  function onDocPointerDown(e) {
    if (!tooltip.contains(e.target)) {
      hideItemTooltip();
    }
  }
  document.addEventListener('pointerdown', onDocPointerDown);
  currentTooltipListener = onDocPointerDown;
}

export function weaponDetailsText(item) {
  const w = WEAPONS[item.key] || item;
  if (!w) return '';
  const baseRate = w.base ? (w.base.attackRate ?? w.base.rate) : null;
  const base = w.base ? `${w.base.min}-${w.base.max} (${baseRate}/s)` : 'n/a';
  const scales = Object.entries(w.scales || {})
    .map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`)
    .join(', ');
  const reqs = w.reqs ? `Realm ${w.reqs.realmMin}, Proficiency ${w.reqs.proficiencyMin}` : 'None';
  const quality = w.quality ?? 'basic';
  const mods = (w.modifiers || []).map(k => MODIFIERS[k]?.desc || k);
  const modLine = mods.length ? mods.join(', ') : 'None';
  const imbLine = item.imbuement
    ? `Imbue: ${item.imbuement.element} Tier ${item.imbuement.tier}`
    : 'Imbue: None';
  return [
    w.displayName || w.name,
    imbLine,
    `Quality: ${quality}`,
    `Modifiers: ${modLine}`,
    `Rarity: ${w.rarity || 'normal'}`,
    `Base: ${base}`,
    `Scales: ${scales}`,
    `Tags: ${(w.tags || []).join(', ')}`,
    `Reqs: ${reqs}`,
  ].join('\n');
}

export function gearDetailsText(item) {
  const lines = [item.name || item.key];
  if (item.quality) lines.push(`Quality: ${item.quality}`);
  if (item.rarity) lines.push(`Rarity: ${item.rarity}`);
  if (item.guardType) lines.push(`Guard: ${item.guardType}`);
  if (item.element) lines.push(`Element: ${item.element}`);
  if (item.imbuement) lines.push(`Imbue: ${item.imbuement.element} Tier ${item.imbuement.tier}`);
  else lines.push('Imbue: None');
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
  if (item.modifiers && item.modifiers.length) {
    const modLine = item.modifiers.map(k => MODIFIERS[k]?.desc || k).join(', ');
    lines.push(`Modifiers: ${modLine}`);
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
        case 'dropRateMult':
          label = 'Drop Rate';
          break;
      }
      return `${label}: +${(v * 100).toFixed(0)}%`;
    });
    lines.push(...bonusLines);
  }
  return lines.join('\n');
}

export function showItemDetails(item, evt) {
  let text = '';
  if (item.type === 'weapon') {
    text = weaponDetailsText(item);
  } else if (['armor', 'foot', 'ring', 'talisman'].includes(item.type)) {
    text = gearDetailsText(item);
  } else {
    text = item.name || item.key;
  }
  const anchor = evt?.currentTarget || evt?.target;
  if (text && anchor) {
    evt.stopPropagation();
    showItemTooltip(anchor, text);
  }
}

