import { on } from '../../../shared/events.js';
import { WEAPON_FLAGS, WEAPONS } from '../../weaponGeneration/data/weapons.js';

const weaponFeatureEnabled = Object.keys(WEAPON_FLAGS).some(w => w !== 'fist' && WEAPON_FLAGS[w]);

export function initializeWeaponChip(initial = { key: 'fist', name: 'Fists' }) {
  if (!weaponFeatureEnabled) return;
  const topChips = document.getElementById('top-chips');
  if (!topChips || document.getElementById('weaponChip')) return;

  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.id = 'weaponChip';
  chip.innerHTML = `Weapon: <span id="weaponName">${initial.name}</span>`;
  topChips.appendChild(chip);
  const hud = document.getElementById('currentWeapon');
  if (hud) hud.textContent = initial.name;
  console.log('[weapon]', 'hud-init', initial.key);
  on('INVENTORY:MAINHAND_CHANGED', updateWeaponChip);
}

export function updateWeaponChip(payload = { key: 'fist', name: 'Fists' }) {
  if (!weaponFeatureEnabled) return;
  const name = payload.name || WEAPONS[payload.key]?.displayName || payload.key || 'Fists';
  const el = document.getElementById('weaponName');
  if (el) el.textContent = name;
  const hud = document.getElementById('currentWeapon');
  if (hud) hud.textContent = name;
  console.log('[weapon]', 'hud-update', payload.key || 'fist');
}
