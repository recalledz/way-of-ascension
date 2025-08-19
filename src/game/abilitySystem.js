import { ABILITIES } from '../data/abilities.js';
import { getEquippedWeapon, processAttack } from './combat.js';
import { S } from './state.js';

/**
 * Get ability slots derived from currently equipped weapon.
 * @param {any} state
 * @returns {Array<import('../data/abilities.js').AbilityDef>}
 */
export function getAbilitySlots(state = S) {
  const slots = [];
  const weapon = getEquippedWeapon(state);
  const abilityKey = weapon.abilityKeys?.[0];
  for (let i = 0; i < 6; i++) {
    if (i === 0 && abilityKey) {
      const def = ABILITIES[abilityKey];
      const meetsReq = def && (!def.requiresWeaponType || def.requiresWeaponType === weapon.typeKey);
      if (meetsReq) {
        const cooldown = state.abilityCooldowns?.[abilityKey] || 0;
        slots.push({
          keybind: i + 1,
          abilityKey,
          isReady: cooldown <= 0 && state.qi >= def.costQi,
          cooldownRemainingMs: cooldown,
          insufficientQi: state.qi < def.costQi,
        });
        continue;
      }
    }
    slots.push({ keybind: i + 1, abilityKey: undefined, isReady: false, cooldownRemainingMs: 0, insufficientQi: false });
  }
  return slots;
}

export function tryCastAbility(abilityKey, state = S) {
  const ability = ABILITIES[abilityKey];
  if (!ability) return false;
  if (!state.adventure?.inCombat) return false;
  const weapon = getEquippedWeapon(state);
  if (ability.requiresWeaponType && ability.requiresWeaponType !== weapon.typeKey) return false;
  if (!weapon.abilityKeys?.includes(abilityKey)) return false;
  const cd = state.abilityCooldowns?.[abilityKey] || 0;
  if (cd > 0) return false;
  if (state.qi < ability.costQi) return false;
  state.qi -= ability.costQi;
  if (!state.abilityCooldowns) state.abilityCooldowns = {};
  state.abilityCooldowns[abilityKey] = ability.cooldownMs;
  if (!state.actionQueue) state.actionQueue = [];
  const enqueue = () => state.actionQueue.push({ type: 'ABILITY_HIT', abilityKey });
  if (ability.castTimeMs > 0) setTimeout(enqueue, ability.castTimeMs);
  else {
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
    if (action.type === 'ABILITY_HIT') resolveAbilityHit(action.abilityKey, state);
  }
}

function resolveAbilityHit(abilityKey, state) {
  switch (abilityKey) {
    case 'powerSlash':
      resolvePowerSlash(state);
      break;
    default:
      break;
  }
}

function resolvePowerSlash(state) {
  const weapon = getEquippedWeapon(state);
  const roll = Math.floor(Math.random() * (weapon.base.max - weapon.base.min + 1)) + weapon.base.min;
  const raw = Math.round(1.3 * roll);
  let dealt = 0;
  state.adventure.enemyHP = processAttack(
    state.adventure.enemyHP,
    raw,
    { target: state.adventure.currentEnemy, type: 'physical', onDamage: d => (dealt = d) }
  );
  state.adventure.combatLog.push(`You used Power Slash for ${dealt} Physical damage.`);
  if (dealt > 0) {
    const healed = Math.min(5, state.hpMax - state.hp);
    state.hp += healed;
    state.adventure.playerHP = state.hp;
    state.adventure.combatLog.push('You recovered 5 HP.');
    showHeal(healed);
  }
}

function showHeal(amount) {
  const el = document.getElementById('hpVal');
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const note = document.createElement('div');
  note.className = 'heal-float';
  note.textContent = `+${amount}`;
  note.style.left = rect.left + 'px';
  note.style.top = rect.top - 20 + 'px';
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1000);
}
