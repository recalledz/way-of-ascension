import { S } from '../../../shared/state.js';
import { on } from '../../../shared/events.js';
import { WEAPON_FLAGS, WEAPONS } from '../../weaponGeneration/data/weapons.js';

const weaponFeatureEnabled = Object.keys(WEAPON_FLAGS).some(w => w !== 'fist' && WEAPON_FLAGS[w]);

export function initializeWeaponChip() {
  if (!weaponFeatureEnabled) return;
  const topChips = document.getElementById('top-chips');
  if (!topChips || document.getElementById('weaponChip')) return;

  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.id = 'weaponChip';
  const key = typeof S.equipment?.mainhand === 'string' ? S.equipment.mainhand : S.equipment?.mainhand?.key;
  chip.innerHTML = `Weapon: <span id="weaponName">${key || 'fist'}</span>`;
  topChips.appendChild(chip);
  console.log('[weapon]', 'hud-init', key || 'fist');
  on('INVENTORY:MAINHAND_CHANGED', updateWeaponChip);
}

export function updateWeaponChip(payload) {
  if (!weaponFeatureEnabled) return;
  const key = payload?.key ?? (typeof S.equipment?.mainhand === 'string' ? S.equipment.mainhand : S.equipment?.mainhand?.key);
  const name = payload?.name ?? WEAPONS[key]?.displayName || key || 'Fists';
  const el = document.getElementById('weaponName');
  if (el) el.textContent = key || 'fist';
  const hud = document.getElementById('currentWeapon');
  if (hud) hud.textContent = name;
  console.log('[weapon]', 'hud-update', key || 'fist');
}
