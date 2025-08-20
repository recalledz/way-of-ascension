import { S } from '../../game/state.js';

export function getEnemyHP(state = S) {
  return state.adventure?.enemyHP || 0;
}

export function getEnemyMaxHP(state = S) {
  return state.adventure?.enemyMaxHP || 0;
}

export function getPlayerStunBar(state = S) {
  return state.adventure?.playerStunBar || 0;
}

export function getEnemyStunBar(state = S) {
  return state.adventure?.enemyStunBar || 0;
}

export function getCurrentEnemy(state = S) {
  return state.adventure?.currentEnemy || null;
}
