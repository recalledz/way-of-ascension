import { getEquippedWeapon } from '../inventory/selectors.js';

export function resolveAbilityHit(abilityKey, state) {
  switch (abilityKey) {
    case 'powerSlash':
      return resolvePowerSlash(state);
    case 'palmStrike':
      return resolvePalmStrike(state);
    case 'flowingPalm':
      return resolveFlowingPalm(state);
    case 'lightningStep':
      return resolveLightningStep(state);
    case 'seventyFive':
      return resolveSeventyFive();
    default:
      return null;
  }
}

function resolveFlowingPalm(state) {
  const weapon = getEquippedWeapon(state);
  const roll = Math.floor(Math.random() * (weapon.base.max - weapon.base.min + 1)) + weapon.base.min;
  return {
    attack: { amount: roll, type: 'physical', target: state.adventure.currentEnemy },
    stun: { mult: 2 },
  };
}

function resolvePowerSlash(state) {
  const weapon = getEquippedWeapon(state);
  const roll = Math.floor(Math.random() * (weapon.base.max - weapon.base.min + 1)) + weapon.base.min;
  const raw = Math.round(1.3 * roll);
  return {
    attack: { amount: raw, type: 'physical', target: state.adventure.currentEnemy },
    healOnHit: 5,
  };
}

function resolvePalmStrike(state) {
  const weapon = getEquippedWeapon(state);
  const roll = Math.floor(Math.random() * (weapon.base.max - weapon.base.min + 1)) + weapon.base.min;
  const raw = Math.round(roll);
  return {
    attack: { amount: raw, type: 'physical', target: state.adventure.currentEnemy },
  };
}

function resolveLightningStep(state) {
  const mods = state.abilityMods?.lightningStep || {};
  const damagePct = 10 + (mods.damagePct || 0);
  const dodgePct = 20 + (mods.dodgePct || 0);
  return {
    buff: { damagePct, dodgePct, durationMs: 10_000 },
  };
}

function resolveSeventyFive() {
  return {
    defeatEnemy: true,
    healToFull: true,
    restoreQi: true,
  };
}
