import { S, save } from '../../src/game/state.js';
import { WEAPONS } from '../../src/data/weapons.js';
import { qs, setText } from '../dom.js';

function createWeaponElement(item){
  const div = document.createElement('div');
  div.className = 'equipment-item';

  const details = document.createElement('div');
  details.className = 'equipment-details';
  const base = item.base ? `${item.base.min}-${item.base.max} (${item.base.attackRate}/s)` : 'N/A';
  const scales = item.scales ? Object.entries(item.scales).map(([k,v]) => `${k} ${(v*100).toFixed(0)}%`).join(', ') : 'None';
  const tags = item.tags ? item.tags.join(', ') : 'None';
  const status = item.statusHooks ? item.statusHooks.join(', ') : 'None';
  details.innerHTML = `<div><strong>${item.displayName}</strong></div>
    <div>Base: ${base}</div>
    <div>Scales: ${scales}</div>
    <div>Tags: ${tags}</div>
    <div>Status: ${status}</div>`;

  const btn = document.createElement('button');
  btn.className = 'btn small';
  btn.textContent = 'Equip';
  btn.onclick = () => {
    S.equipment.mainhand = item.key;
    save();
    setText('currentWeapon', item.displayName);
    renderEquipmentPanel();
  };

  div.appendChild(details);
  div.appendChild(btn);
  return div;
}

function createArmorElement(item){
  const div = document.createElement('div');
  div.className = 'equipment-item';
  const name = item.displayName || item.key || 'Unknown';
  const base = item.base ? `Base: ${item.base}` : '';
  const scales = item.scales ? `Scales: ${Object.entries(item.scales).map(([k,v])=>`${k} ${(v*100).toFixed(0)}%`).join(', ')}` : '';
  const tags = item.tags ? `Tags: ${item.tags.join(', ')}` : '';
  const status = item.statusHooks ? `Status: ${item.statusHooks.join(', ')}` : '';
  div.innerHTML = `<div class="equipment-details"><div><strong>${name}</strong></div>${base?`<div>${base}</div>`:''}${scales?`<div>${scales}</div>`:''}${tags?`<div>${tags}</div>`:''}${status?`<div>${status}</div>`:''}</div>`;
  return div;
}

export function renderEquipmentPanel(){
  const weaponList = qs('#weaponInventory');
  const armorList = qs('#armorInventory');
  if(!weaponList || !armorList) return;

  weaponList.innerHTML = '';
  (S.inventory?.weapons || []).forEach(key => {
    const item = WEAPONS[key];
    if(item) weaponList.appendChild(createWeaponElement(item));
  });

  armorList.innerHTML = '';
  (S.inventory?.armor || []).forEach(item => {
    armorList.appendChild(createArmorElement(item));
  });
}
