import { STATUSES } from './data/status.js';
import { AILMENTS } from './data/ailments.js';

export function applyStatus(target, key, power, state, options = {}) { // STATUS-REFORM
  const def = STATUSES[key];
  if (!def) return;
  const { attackerStats = {}, targetStats = {} } = options;
  if (!target.statuses) target.statuses = {};
  const current = target.statuses[key] || { stacks: 0, duration: 0 };
  current.stacks = Math.min(def.maxStacks ?? Infinity, current.stacks + 1);
  let duration = def.duration;
  if (key === 'stun') {
    duration *= 1 + (attackerStats.stunDurationMult || 0);
    duration *= 1 - (targetStats.stunResist || 0);
  }
  duration *= 1 - (targetStats.ccResist || 0);
  current.duration = duration;
  target.statuses[key] = current;
}

export function applyAilment(attacker, target, key, power, nowMs) {
  const def = AILMENTS[key];
  if (!def || !target) return false;
  const attackerStats = attacker?.stats || {};
  const targetStats = target?.stats || {};
  let finalChance = power;
  finalChance *= 1 + (attackerStats.ailmentChancePct || 0) / 100;
  finalChance *= 1 + (attackerStats[`${key}ChancePct`] || 0) / 100;
  finalChance /= 1 + (targetStats.ailmentResistPct || 0) / 100;
  finalChance /= 1 + (targetStats[`${key}ResistPct`] || 0) / 100;
  if (Math.random() >= finalChance) return false;
  if (!target.ailments) target.ailments = {};
  const current = target.ailments[key] || { stacks: 0, expires: 0 };
  current.stacks = Math.min(def.maxStacks ?? Infinity, current.stacks + 1);
  current.expires = nowMs + def.baseDurationSec * 1000;
  target.ailments[key] = current;
  return true;
}

export function hasAilment(target, key) {
  return !!target?.ailments?.[key];
}

export function clearAilment(target, key) {
  if (target?.ailments) delete target.ailments[key];
}

export function tickAilments(entity, dtSec, state) {
  if (!entity?.ailments) return;
  const now = Date.now();
  for (const key of Object.keys(entity.ailments)) {
    const inst = entity.ailments[key];
    const def = AILMENTS[key];
    if (!def) {
      delete entity.ailments[key];
      continue;
    }

    if (inst.expires > 1e6) {
      inst.expires = (inst.expires - now) / 1000;
    } else {
      inst.expires -= dtSec;
    }

    if (inst._lastStack !== inst.stacks) {
      def.onApply?.({ target: entity, stack: inst.stacks });
      inst._lastStack = inst.stacks;
    }

    if (def.tickRate > 0) {
      const stat = def.scaleStat ? entity.stats?.[def.scaleStat] || 0 : 0;
      const factor = def.scaleFactor ?? 0.1;
      const dmgPerSec = def.tickRate * inst.stacks + stat * factor * inst.stacks;
      dealAilmentDamage(entity, dmgPerSec * dtSec, state);
    }

    if (inst.expires <= 0) {
      def.onExpire?.({ target: entity });
      delete entity.ailments[key];
    }
  }
}

function dealAilmentDamage(target, dmg, state) {
  const amount = Math.round(dmg);
  if (amount <= 0) return;
  if (target === state) {
    state.hp = Math.max(0, (state.hp || 0) - amount);
    if (state.adventure) state.adventure.playerHP = state.hp;
  } else if (target === state.adventure?.currentEnemy) {
    state.adventure.enemyHP = Math.max(0, (state.adventure.enemyHP || 0) - amount);
    if (typeof target.hp === 'number') target.hp = Math.max(0, target.hp - amount);
  } else if (typeof target.hp === 'number') {
    target.hp = Math.max(0, target.hp - amount);
  }
}
