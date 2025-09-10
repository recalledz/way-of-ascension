import { getEquippedWeapon } from '../inventory/selectors.js';
import { S } from '../../shared/state.js';

function buildWeaponAttacks(weapon, mult, target) {
  const attacks = [];
  const phys = weapon.base.phys || { min: 0, max: 0 };
  if ((phys.max ?? 0) > 0 || (phys.min ?? 0) > 0) {
    const physRoll =
      Math.floor(Math.random() * (phys.max - phys.min + 1)) + phys.min;
    if (physRoll > 0) {
      attacks.push({
        amount: Math.round(mult * physRoll),
        type: 'physical',
        target,
      });
    }
  }
  for (const [elem, range] of Object.entries(weapon.base.elems || {})) {
    const elemRoll = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    if (elemRoll > 0) {
      attacks.push({ amount: Math.round(mult * elemRoll), type: elem, target });
    }
  }
  return attacks;
}

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
    case 'rockSling':
      return resolveRockSling(state);
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
  const attacks = buildWeaponAttacks(weapon, 1, state.adventure.currentEnemy);
  return {
    attacks,
    stun: { mult: 2 },
  };
}

function resolvePowerSlash(state) {
  const weapon = getEquippedWeapon(state);
  const attacks = buildWeaponAttacks(weapon, 1.3, state.adventure.currentEnemy);
  return {
    attacks,
    healOnHit: 5,
  };
}

function resolveFireball(state) {
  const level = S.mind?.manualProgress?.fireballManual?.level || 0;
  const damage = 40 + level * 20;
  return {
    attacks: [{ amount: damage, type: 'fire', target: state.adventure.currentEnemy }],

   };
}

function resolveRockSling(state) {
  const damage = Math.floor(Math.random() * 11) + 10;
  return {
    attacks: [
      { amount: damage, type: 'earth', target: state.adventure.currentEnemy },
    ],
    stunBuildPct: 20,
  };
}

function resolvePalmStrike(state) {
  const weapon = getEquippedWeapon(state);
  const attacks = buildWeaponAttacks(weapon, 1, state.adventure.currentEnemy);
  return {
    attacks,
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
