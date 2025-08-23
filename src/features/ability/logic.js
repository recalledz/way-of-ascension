import { processAttack } from '../combat/mutators.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { qCap } from '../progression/selectors.js';
import { showHeal } from '../combat/ui/fx.js';

export function resolveAbilityHit(abilityKey, state, { roll = 0 } = {}) {
  switch (abilityKey) {
    case 'powerSlash':
      resolvePowerSlash(state, roll);
      break;
    case 'seventyFive':
      resolveSeventyFive(state);
      break;
    default:
      break;
  }
}

function resolvePowerSlash(state, roll) {
  const weapon = getEquippedWeapon(state);
  const scaled = Math.floor(roll * (weapon.base.max - weapon.base.min + 1)) + weapon.base.min;
  const raw = Math.round(1.3 * scaled);
  const dealt = processAttack(
    raw,
    { target: state.adventure.currentEnemy, type: 'physical' },
    state
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

function resolveSeventyFive(state) {
  if (!state?.adventure) return;
  // Deal 100% of enemy HP (instant defeat)
  const before = state.adventure.enemyHP || 0;
  state.adventure.enemyHP = 0;
  // Heal player to full
  const healAmt = Math.max(0, (state.hpMax || 0) - (state.hp || 0));
  state.hp = state.hpMax;
  state.adventure.playerHP = state.hpMax;
  if (!state.adventure.combatLog) state.adventure.combatLog = [];
  state.adventure.combatLog.push(`You unleash 75%! It deals ${Math.round(before)} true damage and fells the enemy.`);
  if (healAmt > 0) {
    state.adventure.combatLog.push(`You are restored for ${healAmt} HP.`);
    showHeal(healAmt);
  }
  // Restore Qi to full
  try {
    state.qi = qCap(state);
  } catch {
    // Fallback if qCap unavailable for some reason
    state.qi = state.qiMax || state.qi || 0;
  }
}

