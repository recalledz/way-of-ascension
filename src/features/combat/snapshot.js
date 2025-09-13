import { calculatePlayerCombatAttack } from '../progression/selectors.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { getWeaponProficiencyBonuses } from '../proficiency/selectors.js';

/**
 * Build a snapshot of the player's offensive stats used for combat.
 * Includes the base weapon profile, per-category percentage buckets,
 * critical values, global multiplier and equipped weapon reference.
 */
export function buildPlayerSnapshot(state) {
  const weapon = getEquippedWeapon(state);
  const profile = calculatePlayerCombatAttack(state);

  const pct = {};
  if (profile.phys > 0) {
    const physTree = (state.astralTreeBonuses?.physicalDamagePct || 0) / 100;
    if (physTree) pct.physical = physTree;
  }
  for (const elem of Object.keys(profile.elems)) {
    const key = `${elem}DamagePct`;
    const val = (state.astralTreeBonuses?.[key] || 0) / 100;
    if (val) pct[elem] = (pct[elem] || 0) + val;
  }

  const profBonus = getWeaponProficiencyBonuses(state).damageMult - 1;
  if (profBonus) pct.all = (pct.all || 0) + profBonus;

  const critChance = state.attributes?.criticalChance || 0;

  return {
    weapon,
    profile,
    pct,
    critChance,
    critMult: 2,
    globalPct: 0,
  };
}
