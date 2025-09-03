import { S } from '../../shared/state.js';
import { initializeFight as baseInitializeFight, processAttack as baseProcessAttack } from './logic.js';
import { applyStatus as baseApplyStatus, applyAilment as baseApplyAilment } from './statusEngine.js';

export function applyStatus(target, key, power, state = S, options) {
  return baseApplyStatus(target, key, power, state, options);
}

export function applyAilment(attacker, target, key, power, nowMs, state = S) {
  return baseApplyAilment(attacker, target, key, power, nowMs, state);
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

export function processAttack(profile, weapon, options = {}, state = S) {
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

  const result = baseProcessAttack(profile, weapon, {
    ...options,
    target,
  });

  const newHP = Math.max(0, Math.round(currentHP - result.total));

  if (target === state || target === S) {
    state.adventure.playerHP = newHP;
    state.hp = newHP;
  } else if (target === state.adventure?.currentEnemy) {
    state.adventure.enemyHP = newHP;
  } else if (typeof target?.hp === 'number') {
    target.hp = newHP;
  }

  return result;
}

