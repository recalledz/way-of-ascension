import { S, save } from '../../game/state.js';
import { addToInventory } from '../inventory/mutators.js';

// EQUIP-CHAR-UI: session loot helpers
export function addSessionLoot(item, state = S) {
  state.sessionLoot = state.sessionLoot || [];
  const id = item.id || Date.now() + Math.random();
  state.sessionLoot.push({ ...item, id, qty: item.qty || 1 });
  console.log('[loot-session] add', item);
  save?.();
}

export function claimSessionLoot(state = S) {
  state.sessionLoot = state.sessionLoot || [];
  const count = state.sessionLoot.length;
  state.sessionLoot.forEach(item => {
    if (item.type === 'mat') {
      state[item.key] = (state[item.key] || 0) + (item.qty || 1);
    } else {
      addToInventory(item);
    }
  });
  state.sessionLoot = [];
  console.log('[loot-session] claim', count);
  save?.();
  return count;
}

export function forfeitSessionLoot(state = S) {
  const count = (state.sessionLoot || []).length;
  state.sessionLoot = [];
  console.log('[loot-session] forfeit', count);
  save?.();
  return count;
}
