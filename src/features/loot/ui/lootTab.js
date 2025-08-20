import { S } from '../../../shared/state.js';
import { getSessionLoot } from '../selectors.js';
import { forfeitSessionLoot } from '../mutators.js';

export function updateLootTab(state = S) {
  const list = document.getElementById('sessionLootList');
  if (!list) return;
  list.innerHTML = '';
  getSessionLoot(state).forEach(item => {
    const row = document.createElement('div');
    row.className = 'loot-row';
    const src = item.source ? ` (${item.source})` : '';
    row.textContent = `${item.qty || 1} ${item.key}${src}`;
    list.appendChild(row);
  });
}

export function setupLootUI({ retreatFromCombat, renderEquipmentPanel, state = S } = {}) {
  document.getElementById('claimLootBtn')?.addEventListener('click', () => {
    retreatFromCombat?.();
    renderEquipmentPanel?.();
  });
  document.getElementById('forfeitLootBtn')?.addEventListener('click', () => {
    if (confirm('Forfeit all loot?')) {
      forfeitSessionLoot(state);
      updateLootTab(state);
    }
  });
}
