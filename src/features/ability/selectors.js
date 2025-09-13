import { S } from '../../shared/state.js';
import { ABILITIES } from './data/abilities.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { resolveAbilityHit } from './logic.js';
import { getStatEffects, calculatePlayerAttackSnapshot } from '../progression/selectors.js';

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
  const attacks = res?.attacks || (res?.attack ? [res.attack] : []);
  if (!attacks.length) return null;
  const mods = state.abilityMods?.[abilityKey] || {};
  const snap = calculatePlayerAttackSnapshot(state);
  const weapon = getEquippedWeapon(state);
  const isSpell = ability.tags?.includes('spell');
  let total = 0;
  for (const atk of attacks) {
    let amt = atk.amount;
    let globalMult = 1;
    if (mods.damagePct) globalMult *= 1 + mods.damagePct / 100;
    const gearPct = { ...snap.gearPct };
    if (isSpell) {
      if (weapon.classKey !== 'focus') delete gearPct.all;
      const { spellPowerMult } = getStatEffects(state);
      const spellDamage = state.derivedStats?.spellDamage || 0;
      const spellTreeMult = 1 + (state.astralTreeBonuses?.spellDamagePct || 0) / 100;
      globalMult *= spellPowerMult * (1 + spellDamage / 100) * spellTreeMult;
    }
    const elem = atk.type;
    const astral = snap.astralPct[elem === 'physical' ? 'physical' : elem] || 0;
    const gear = (gearPct[elem] || 0) + (gearPct.all || 0);
    amt *= (1 + astral) * (1 + gear);
    total += amt * globalMult;
  }
  return Math.round(total * (1 + snap.globalPct));
}
