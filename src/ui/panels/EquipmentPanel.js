import { WEAPONS } from '../../data/weapons.js';
import { S, save } from '../../game/state.js';

// WEAPONS-INTEGRATION: render weapon inventory and equip flow
export function equipWeapon(key, state = S) {
  if (!state.flags?.weaponsEnabled) return;
  if (!WEAPONS[key]) return;
  state.equipment.mainhand = key;
  console.log('[equip]', key);
  save?.();
  renderEquipmentPanel(state);
}

function scrapWeapon(index, state) {
  const item = state.inventory.weapons[index];
  if (!item) return;
  state.inventory.weapons.splice(index, 1);
  state.ore = (state.ore || 0) + 1;
  save?.();
  renderEquipmentPanel(state);
}

function weaponDetailsText(item) {
  const w = WEAPONS[item.key];
  if (!w) return '';
  const base = w.base ? `${w.base.min}-${w.base.max} (${w.base.attackRate}/s)` : 'n/a';
  const scales = Object.entries(w.scales || {})
    .map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`)
    .join(', ');
  const reqs = w.reqs ? `Realm ${w.reqs.realmMin}, Proficiency ${w.reqs.proficiencyMin}` : 'None';
  return `${w.displayName}\nBase: ${base}\nScales: ${scales}\nTags: ${(w.tags || []).join(', ')}\nReqs: ${reqs}`;
}

function showDetails(item) {
  const text = weaponDetailsText(item);
  if (text) window.alert(text);
}

export function renderEquipmentPanel(state = S) {
  if (!state.flags?.weaponsEnabled) return;
  const list = document.getElementById('weaponInventory');
  if (!list) return;
  list.innerHTML = '';
  state.inventory.weapons.forEach((item, idx) => {
    const weapon = WEAPONS[item.key];
    if (!weapon) return;
    const div = document.createElement('div');
    div.className = 'equipment-item';
    div.innerHTML = `<div class="equipment-details"><strong>${weapon.displayName}</strong></div>`;
    const tooltip = weaponDetailsText(item);
    if (tooltip) div.title = tooltip;
    const equipBtn = document.createElement('button');
    equipBtn.className = 'btn small';
    equipBtn.textContent = 'Equip';
    equipBtn.onclick = () => equipWeapon(item.key, state);
    const scrapBtn = document.createElement('button');
    scrapBtn.className = 'btn small warn';
    scrapBtn.textContent = 'Scrap';
    scrapBtn.onclick = () => scrapWeapon(idx, state);
    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'btn small';
    detailsBtn.textContent = 'Details';
    detailsBtn.onclick = () => showDetails(item);
    div.appendChild(equipBtn);
    div.appendChild(scrapBtn);
    div.appendChild(detailsBtn);
    list.appendChild(div);
  });
  const hud = document.getElementById('currentWeapon');
  if (hud && state.equipment.mainhand) {
    hud.textContent = WEAPONS[state.equipment.mainhand]?.displayName || 'Fists';
  }
}
