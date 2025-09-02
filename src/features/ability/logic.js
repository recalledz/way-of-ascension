import { getEquippedWeapon } from '../inventory/selectors.js';
import { S } from '../../shared/state.js';

export function resolveAbilityHit(abilityKey, state) {
  switch (abilityKey) {
    case 'powerSlash':
      return resolvePowerSlash(state);
    case 'palmStrike':
      return resolvePalmStrike(state);
    case 'flowingPalm':
      return resolveFlowingPalm(state);
    case 'fireball':
      return resolveFireball(state);
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
  const roll = Math.floor(Math.random() * (weapon.base.phys.max - weapon.base.phys.min + 1)) + weapon.base.phys.min;
  return {
    attack: { amount: roll, type: 'physical', target: state.adventure.currentEnemy },
    stun: { mult: 2 },
  };
}

function resolvePowerSlash(state) {
  const weapon = getEquippedWeapon(state);
  const roll = Math.floor(Math.random() * (weapon.base.phys.max - weapon.base.phys.min + 1)) + weapon.base.phys.min;
  const raw = Math.round(1.3 * roll);
  return {
    attack: { amount: raw, type: 'physical', target: state.adventure.currentEnemy },
    healOnHit: 5,
  };
}

function resolveFireball(state) {
  const level = S.mind?.manualProgress?.fireballManual?.level || 0;
  const damage = 40 + level * 20;
  return {
    attack: { amount: damage, type: 'fire', target: state.adventure.currentEnemy },

   };
}

function resolvePalmStrike(state) {
  const weapon = getEquippedWeapon(state);
  const roll = Math.floor(Math.random() * (weapon.base.phys.max - weapon.base.phys.min + 1)) + weapon.base.phys.min;
  const raw = Math.round(roll);
  return {
    attack: { amount: raw, type: 'physical', target: state.adventure.currentEnemy },
  };
}

function resolveLightningStep(state) {
  const level = S.mind?.manualProgress?.lightningStepManual?.level || 0;
  const durationMs = 10_000 + level * 1_000;
  const damageMult = 1.3 + level * 0.05;
  state.lightningStep = {
    attackSpeedMult: 1.2,
    damageMult,
    expiresAt: Date.now() + durationMs,
  };
  return {};
}

function resolveSeventyFive() {
  return {
    defeatEnemy: true,
    healToFull: true,
    restoreQi: true,
  };
}
