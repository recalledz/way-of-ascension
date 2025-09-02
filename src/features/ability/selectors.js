import { S } from '../../shared/state.js';
import { ABILITIES } from './data/abilities.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { resolveAbilityHit } from './logic.js';
import { getStatEffects } from '../progression/selectors.js';

export function getAbilityCooldowns(state = S) {
  return state.abilityCooldowns || {};
}

export function getAbilitySlots(state = S) {
  const slots = [];
  const weapon = getEquippedWeapon(state);

  // Build ordered list of ability keys: weapon ability first, then manual abilities
  const abilityKeys = [];
  if (weapon.abilityKeys?.[0]) abilityKeys.push(weapon.abilityKeys[0]);
  if (state.manualAbilityKeys) abilityKeys.push(...state.manualAbilityKeys);

  for (let i = 0; i < 6; i++) {
    const abilityKey = abilityKeys[i];
    if (abilityKey) {
      const def = ABILITIES[abilityKey];
      const meetsReq = def && (!def.requiresWeaponClass || def.requiresWeaponClass === weapon.classKey);
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

export function getAbilityDamage(abilityKey, state = S) {
  const ability = ABILITIES[abilityKey];
  if (!ability) return null;
  const res = resolveAbilityHit(abilityKey, state);
  const attack = res?.attack;
  if (!attack) return null;
  let amount = attack.amount;
  const mods = state.abilityMods?.[abilityKey] || {};
  if (mods.damagePct) amount = Math.round(amount * (1 + mods.damagePct / 100));
  if (ability.tags?.includes('spell')) {
    const { spellPowerMult } = getStatEffects(state);
    const spellDamage = state.stats?.spellDamage || 0;
    const treeMult = 1 + (state.astralTreeBonuses?.spellDamagePct || 0) / 100;
    amount = Math.round(amount * spellPowerMult * (1 + spellDamage / 100) * treeMult);
  }
  return amount;
}
