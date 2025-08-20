import { S } from '../../../shared/state.js';
import { WEAPON_FLAGS } from '../../weaponGeneration/data/weapons.js';

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
}

export function updateWeaponChip() {
  if (!weaponFeatureEnabled) return;
  const el = document.getElementById('weaponName');
  if (el) {
    const key = typeof S.equipment?.mainhand === 'string' ? S.equipment.mainhand : S.equipment?.mainhand?.key;
    el.textContent = key || 'fist';
    console.log('[weapon]', 'hud-update', key || 'fist');
  }
}
