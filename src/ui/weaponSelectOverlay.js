import { addToInventory, equipItem } from '../features/inventory/mutators.js';
import { generateWeapon } from '../features/weaponGeneration/logic.js';
import { WEAPON_TYPES } from '../features/weaponGeneration/data/weaponTypes.js';
import { WEAPON_ICONS } from '../features/weaponGeneration/data/weaponIcons.js';

function createWeapon(typeKey) {
  return generateWeapon({ typeKey });
}

function renderOption(key) {
  const sample = createWeapon(key);
  const icon = WEAPON_ICONS[sample.classKey];
  return `
    <button class="weapon-option" data-key="${key}">
      <iconify-icon icon="${icon}" class="weapon-icon"></iconify-icon>
      <span>${sample.name}</span>
    </button>
  `;
}

export function showWeaponSelectOverlay(state) {
  let overlay = document.getElementById('weaponSelectOverlay');
  if (overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = 'weaponSelectOverlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content card weapon-select-card">
      <div class="card-header">
        <h4>Select Your Weapon</h4>
        <button class="btn small ghost close-btn">×</button>
      </div>
      <div class="weapon-options">
        ${Object.keys(WEAPON_TYPES).map(renderOption).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);

  function close() {
    overlay.remove();
  }
  overlay.querySelector('.close-btn').addEventListener('click', close);
  overlay.querySelector('.modal-backdrop').addEventListener('click', close);

  overlay.querySelectorAll('.weapon-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      const weapon = createWeapon(key);
      const id = addToInventory(weapon, state);
      const item = state.inventory.find(it => it.id === id);
      equipItem(item, 'mainhand', state);
      close();
    });
  });
}
