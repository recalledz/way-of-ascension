import {
  calcArmor,
  calculatePlayerAttackSnapshot,
  calculatePlayerAttackRate,
} from '../features/progression/logic.js';
import { REALMS } from '../features/progression/data/realms.js';
import { effectiveHP } from '../lib/power/ehp.js';
import { BASELINE_DPS, BASELINE_EHP } from './baseline.js';

export const W_O = 0.6;
export const W_D = 0.4;

/**
 * Basic player power calculations. OPP (Offensive Power Points) and DPP
 * (Defensive Power Points) are derived from the player's current attack and
 * armor values. PP represents the total power.
 *
 * @param {object} state Player or global state object
 * @returns {{ OPP: number, DPP: number }}
 */
export function gatherDefense(state) {
  const hp = state.hpMax || state.hp || 0;
  const armor = state.derivedStats?.armor ?? calcArmor(state);
  const dodge = state.derivedStats?.dodge || 0;
  const resists = state.resists || {};
  const qiRegenPct =
    ((state.qiRegenMult || 0) + (state.gearBonuses?.qiRegenMult || 0)) * 100 +
    (state.astralTreeBonuses?.qiRegenPct || 0);
  const maxQiPct = ((state.shield?.max || 0) / (hp || 1)) * 100;
  return { hp, armor, dodge, resists, qiRegenPct, maxQiPct };
}

export function computePP(state, overrides = {}) {
  const snap = calculatePlayerAttackSnapshot(state);
  const attackRate = calculatePlayerAttackRate(state);
  const combinePct = elem =>
    (snap.gearPct?.all || 0) +
    (snap.gearPct?.[elem] || 0) +
    (snap.astralPct?.[elem] || 0) +
    (snap.globalPct || 0);

  let damagePerHit = snap.profile.phys * (1 + combinePct('physical'));
  for (const [elem, dmg] of Object.entries(snap.profile.elems || {})) {
    damagePerHit += dmg * (1 + combinePct(elem));
  }
  damagePerHit *= 1 + (snap.critChance || 0) * ((snap.critMult || 1) - 1);
  damagePerHit *= 1 + (snap.power?.opFromCult || 0);

  const safeAttackRate = Number.isFinite(attackRate) ? attackRate : 0;
  const rawDps = damagePerHit * safeAttackRate;

  const dp = { ...gatherDefense(state), ...overrides };
  const rawEhp = effectiveHP({
    hp: dp.hp,
    armor: dp.armor,
    dodge: dp.dodge,
    resists: dp.resists,
    qiRegenPct: dp.qiRegenPct,
    maxQiPct: dp.maxQiPct,
  });
  const scaledEhp = rawEhp * (1 + (snap.power?.dpFromCult || 0));

  const oppPct = BASELINE_DPS > 0 ? 100 * (rawDps / BASELINE_DPS - 1) : 0;
  const dppPct = BASELINE_EHP > 0 ? 100 * (scaledEhp / BASELINE_EHP - 1) : 0;
  const OPP = Number.isFinite(oppPct) ? oppPct : 0;
  const DPP = Number.isFinite(dppPct) ? dppPct : 0;

  return {
    OPP,
    DPP,
    raw: {
      dps: rawDps,
      damagePerHit,
      attackRate: safeAttackRate,
      ehp: scaledEhp,
    },
  };
}

/**
 * Convenience selector for current total power points.
 *
 * @param {object} state Player or global state object
 * @returns {{ PP:number, OPP:number, DPP:number }}
 */
export function getCurrentPP(state) {
  const { OPP, DPP, raw } = computePP(state);
  return {
    OPP,
    DPP,
    PP: W_O * OPP + W_D * DPP,
    raw,
  };
}

/**
 * Create a snapshot of current and post-breakthrough power points.
 * Simulates the next realm/stage advancement and compares the resulting
 * Offensive/Defensive/total Power Points.
 *
 * @param {object} state Player state
 * @returns {{ before:{OPP:number,DPP:number,PP:number}, after:{OPP:number,DPP:number,PP:number}, diff:{OPP:number,DPP:number,PP:number} }}
 */
export function breakthroughPPSnapshot(state) {
  const before = computePP(state);
  const beforePP = W_O * before.OPP + W_D * before.DPP;

  // Deep clone relevant pieces to simulate the breakthrough
  const sim = JSON.parse(JSON.stringify(state));

  // Determine if the next breakthrough advances the realm or just the stage
  const stages = REALMS[sim.realm.tier].stages;
  if (sim.realm.stage >= stages) {
    // Realm advancement
    sim.realm.tier++;
    sim.realm.stage = 1;
  } else {
    // Stage advancement
    sim.realm.stage++;
  }

  const after = computePP(sim);
  const afterPP = W_O * after.OPP + W_D * after.DPP;
  const diff = {
    OPP: after.OPP - before.OPP,
    DPP: after.DPP - before.DPP,
    PP: afterPP - beforePP,
  };

  return {
    before: { ...before, PP: beforePP },
    after: { ...after, PP: afterPP },
    diff,
  };
}
