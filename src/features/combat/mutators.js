import { S } from '../../shared/state.js';
import { initializeFight as baseInitializeFight, processAttack as baseProcessAttack } from './logic.js';
import { applyStatus as baseApplyStatus, applyAilment as baseApplyAilment } from './statusEngine.js';

export function applyStatus(target, key, power, state = S, options) {
  return baseApplyStatus(target, key, power, state, options);
}

export function applyAilment(attacker, target, key, power, nowMs) {
  return baseApplyAilment(attacker, target, key, power, nowMs);
}

export function initializeFight(enemy, state = S) {
  const { enemyHP, enemyMax, atk, def } = baseInitializeFight(enemy);
  if (state.adventure) {
    state.adventure.enemyHP = enemyHP;
    state.adventure.enemyMaxHP = enemyMax;
    state.adventure.currentEnemy = enemy;
    state.adventure.enemyStunBar = 0;
    state.adventure.playerStunBar = 0;
  }
  return { enemyHP, enemyMax, atk, def };
}

export function processAttack(attacks, options = {}, state = S) {
  let dealt = 0;
  const target = options.target || state.adventure?.currentEnemy;
  let currentHP;

  if (target === state || target === S) {
    currentHP = state.adventure.playerHP;
  } else if (target === state.adventure?.currentEnemy) {
    currentHP = state.adventure.enemyHP;
  } else if (typeof target?.hp === 'number') {
    currentHP = target.hp;
  } else {
    currentHP = state.adventure.enemyHP;
  }

  const newHP = baseProcessAttack(currentHP, attacks, {
    ...options,
    target,
    onDamage: d => (dealt = d),
  });

  if (target === state || target === S) {
    state.adventure.playerHP = newHP;
    state.hp = newHP;
  } else if (target === state.adventure?.currentEnemy) {
    state.adventure.enemyHP = newHP;
  } else if (typeof target?.hp === 'number') {
    target.hp = newHP;
  }

  return dealt;
}

