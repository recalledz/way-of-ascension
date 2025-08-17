import { S, save } from '../state.js';
import { addToInventory } from './inventory.js';

// EQUIP-CHAR-UI: session loot helpers
export function addSessionLoot(item) {
  S.sessionLoot = S.sessionLoot || [];
  const id = item.id || Date.now() + Math.random();
  S.sessionLoot.push({ ...item, id, qty: item.qty || 1 });
  console.log('[loot-session] add', item);
  save?.();
}

export function claimSessionLoot() {
  S.sessionLoot = S.sessionLoot || [];
  const count = S.sessionLoot.length;
  S.sessionLoot.forEach(item => {
    if (item.type === 'mat') {
      S[item.key] = (S[item.key] || 0) + (item.qty || 1);
    } else {
      addToInventory(item);
    }
  });
  S.sessionLoot = [];
  console.log('[loot-session] claim', count);
  save?.();
  return count;
}

export function forfeitSessionLoot() {
  const count = (S.sessionLoot || []).length;
  S.sessionLoot = [];
  console.log('[loot-session] forfeit', count);
  save?.();
  return count;
}
