import { S } from '../../shared/state.js';
import { ABILITIES } from './data/abilities.js';
import { resolveAbilityHit } from './logic.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { getWeaponProficiencyBonuses } from '../proficiency/selectors.js';
import { processAttack, applyStatus, applyAilment } from '../combat/mutators.js';
import { buildAttackSnapshot } from '../combat/snapshot.js';
import { addStunPercent } from '../../engine/combat/stun.js';
import { performAttack } from '../combat/attack.js';
import { mergeStats } from '../../shared/utils/stats.js';
import { chanceToHit, DODGE_BASE } from '../combat/hit.js';
import { getStatEffects } from '../progression/selectors.js';
import { emit } from '../../shared/events.js';
import { qCap } from '../progression/selectors.js';

export function tryCastAbility(abilityKey, state = S) {
  const ability = ABILITIES[abilityKey];
  if (!ability) return false;
  if (state.currentCast) return false;
  if (!state.adventure?.inCombat) return false;
  const weapon = getEquippedWeapon(state);
  if (ability.requiresWeaponClass && ability.requiresWeaponClass !== weapon.classKey) return false;
  const unlocked = weapon.abilityKeys?.includes(abilityKey) || state.manualAbilityKeys?.includes(abilityKey);
  if (!unlocked) return false;
  const mods = state.abilityMods?.[abilityKey] || {};
  const cd = state.abilityCooldowns?.[abilityKey] || 0;
  if (cd > 0) return false;
  if (state.qi < ability.costQi) return false;
  if (!state.abilityCooldowns) state.abilityCooldowns = {};
  const isSpell = ability.tags?.includes('spell');
  const speedMult =
    isSpell && weapon.classKey === 'focus'
      ? getWeaponProficiencyBonuses(state).speedMult
      : 1;
  const cooldownMs = Math.round(
    ability.cooldownMs *
      (1 + (mods.cooldownPct || 0) / 100) *
      (1 + (state.astralTreeBonuses?.cooldownPct || 0) / 100) /
      speedMult
  );
  state.abilityCooldowns[abilityKey] = cooldownMs;
  if (!state.actionQueue) state.actionQueue = [];
  const enqueue = () => state.actionQueue.push({ type: 'ABILITY_HIT', abilityKey });
  let castTimeMs = Math.round(
    ability.castTimeMs *
      (1 + (mods.castTimePct || 0) / 100) /
      (1 + (state.astralTreeBonuses?.castSpeedPct || 0) / 100) /
      speedMult
  );
  if (castTimeMs > 0) {
    state.currentCast = { abilityKey, startMs: Date.now(), duration: castTimeMs };
    emit('CAST:START', { abilityKey, castTimeMs });
    setTimeout(() => {
      enqueue();
      delete state.currentCast;
      emit('CAST:END', { abilityKey });
      processAbilityQueue(state);
    }, castTimeMs);
  } else {
    enqueue();
    processAbilityQueue(state);
  }
  return true;
}

export function tickAbilityCooldowns(dtMs, state = S) {
  if (!state.abilityCooldowns) return;
  for (const k in state.abilityCooldowns) {
    state.abilityCooldowns[k] = Math.max(0, state.abilityCooldowns[k] - dtMs);
  }
}

export function processAbilityQueue(state = S) {
  if (!state.actionQueue || !state.actionQueue.length) return;
  while (state.actionQueue.length) {
    const action = state.actionQueue.shift();
    if (action.type === 'ABILITY_HIT') {
      const res = resolveAbilityHit(action.abilityKey, state);
      applyAbilityResult(action.abilityKey, res, state);
    }
  }
}

function applyAbilityResult(abilityKey, res, state) {
  emit('ABILITY:CAST', { abilityKey });
  if (!res) return;
  const ability = ABILITIES[abilityKey];
  const logs = state.adventure?.combatLog;
  const mods = state.abilityMods?.[abilityKey];
  const weapon = getEquippedWeapon(state);
  const attackerStats = mergeStats({ ...state.attributes, ...state.derivedStats }, weapon?.stats);
  const attacks = res.attacks || (res.attack ? [res.attack] : []);
  if (attacks.length) {
    const { target } = attacks[0];
    const targetStats = target?.stats || {};
    const attackerCtx = { ...(state || {}), stats: attackerStats };
    const now = Date.now();
    const isSpell = ability.tags?.includes('spell');

    if (!isSpell) {
      const enemyDodge = (target?.stats?.dodge ?? target?.dodge ?? 0) + DODGE_BASE;
      const hitP = chanceToHit(state.derivedStats?.accuracy || 0, enemyDodge);
      if (Math.random() >= hitP) {
        logs?.push(`Your ${ability.displayName} missed!`);
        return;
      }
    }

    let totalDealt = 0;
    for (const atk of attacks) {
      const { type, target: atkTarget } = atk;
      let amount = atk.amount;

      let mult = 1;
      if (mods?.damagePct) {
        mult *= 1 + mods.damagePct / 100;
      }

      if (isSpell) {
        if (weapon.classKey === 'focus') {
          mult *= getWeaponProficiencyBonuses(state).damageMult;
        }
        const { spellPowerMult } = getStatEffects(state);
        const spellDamage = state.derivedStats?.spellDamage || 0;
        const spellTreeMult = 1 + (state.astralTreeBonuses?.spellDamagePct || 0) / 100;
        mult *= spellPowerMult * (1 + spellDamage / 100) * spellTreeMult;
      }

      const profile =
        type === 'physical'
          ? { phys: amount, elems: {} }
          : { phys: 0, elems: { [type]: amount } };

      const snap = buildAttackSnapshot(state);
      const catPct = {};
      if (!isSpell) {
        const key = type === 'physical' ? 'physical' : type;
        catPct[key] = snap.catPct[key] || 0;
      }
      let globalMult = (1 + snap.globalPct) * mult;
      const globalPct = globalMult - 1;

      const { total: dealt, components } = processAttack(
        profile,
        weapon,
        {
          target: atkTarget,
          attacker: state,
          nowMs: now,
          catPct,
          globalPct,
          critChance: 0,
          critMult: 1,
          attackSpeed: 1,
          hitChance: 1,
        },
        state
      );
      totalDealt += dealt;
      const parts = [];
      if (components.phys) parts.push(`${components.phys} physical`);
      for (const [elem, val] of Object.entries(components.elems)) {
        parts.push(`${val} ${elem}`);
      }
      const compText = parts.length ? ` (${parts.join(', ')})` : '';
      logs?.push(`You used ${ability.displayName} for ${dealt} damage${compText}.`);

      performAttack(state, atkTarget, { weapon, profile, physDamage: components.phys }, state);
    }

    if (ability.status) {
      const { key, power } = ability.status;
      applyAilment(attackerCtx, target, key, power, now, state);
    }

    if (res.stunBuildPct) {
      const stunBuildPct = res.stunBuildPct * (1 + (mods?.stunPct || 0) / 100);
      addStunPercent(target.stun, stunBuildPct, { attackerStats, targetStats });
    } else if (res.stun) {
      const mult = (res.stun.mult || 0) * (1 + (mods?.stunPct || 0) / 100);
      const stunAttackerStats = {
        ...attackerStats,
        stunDurationMult: (attackerStats.stunDurationMult || 0) + (mult - 1),
      };
      applyStatus(target, 'stun', 1, state, {
        attackerStats: stunAttackerStats,
        targetStats,
      });
    }
    if (res.healOnHit && totalDealt > 0) {
      const healed = Math.min(res.healOnHit, state.hpMax - state.hp);
      state.hp += healed;
      state.adventure.playerHP = state.hp;
      logs?.push(`You recovered ${healed} HP.`);
      emit('ABILITY:HEAL', { amount: healed });
    }
  }
  if (res.defeatEnemy) {
    const before = state.adventure.enemyHP || 0;
    state.adventure.enemyHP = 0;
    logs?.push(`You unleash 75%! It deals ${Math.round(before)} true damage and fells the enemy.`);
  }
  if (res.healToFull) {
    const healAmt = Math.max(0, state.hpMax - state.hp);
    state.hp = state.hpMax;
    state.adventure.playerHP = state.hpMax;
    if (healAmt > 0) {
      logs?.push(`You are restored for ${healAmt} HP.`);
      emit('ABILITY:HEAL', { amount: healAmt });
    }
  }
  if (res.restoreQi) {
    try {
      state.qi = qCap(state);
    } catch {
      state.qi = state.qiMax || state.qi || 0;
    }
  }
  if (abilityKey === 'lightningStep' || abilityKey === 'fireball') {
    emit('ABILITY:FX', { abilityKey });
  }
}
