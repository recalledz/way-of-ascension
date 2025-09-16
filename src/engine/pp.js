import {
  calcArmor,
  calculatePlayerAttackSnapshot,
  calculatePlayerAttackRate,
} from '../features/progression/logic.js';
import { REALMS } from '../features/progression/data/realms.js';
import {
  drFromArmor,
  dEhpFromHP,
  dEhpFromDodge,
  dEhpFromRes,
  dEhpFromQiRegenPct,
  dEhpFromMaxQiPct,
} from '../lib/power/ehp.js';
import { BASELINE_HP, BASELINE_DPS } from '../lib/power/baseline.js';

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

  let damagePerAttack = snap.profile.phys * (1 + combinePct('physical'));
  for (const [elem, dmg] of Object.entries(snap.profile.elems || {})) {
    damagePerAttack += dmg * (1 + combinePct(elem));
  }
  damagePerAttack *= 1 + (snap.critChance || 0) * ((snap.critMult || 1) - 1);
  damagePerAttack *= 1 + (snap.power?.opFromCult || 0);

  const playerDps = damagePerAttack * attackRate;
  const baseDps = BASELINE_DPS || 1;
  const OPP = baseDps > 0 ? ((playerDps / baseDps) - 1) * 100 : 0;

  const dp = { ...gatherDefense(state), ...overrides };
  const dr = drFromArmor(dp.armor);
  let ehpPct = dEhpFromHP(dp.hp, dr);
  for (const val of Object.values(dp.resists || {})) {
    ehpPct += dEhpFromRes(val);
  }
  ehpPct += dEhpFromDodge(dp.dodge);
  ehpPct += dEhpFromQiRegenPct(dp.qiRegenPct);
  ehpPct += dEhpFromMaxQiPct(dp.maxQiPct);
  ehpPct *= 1 + (snap.power?.dpFromCult || 0);
  const DPP = ehpPct * 100;
  const baseHp = BASELINE_HP || 1;
  const playerEhp = (1 + ehpPct) * baseHp;
  return { OPP, DPP, dps: playerDps, ehp: playerEhp };
}

/**
 * Convenience selector for current total power points.
 *
 * @param {object} state Player or global state object
 * @returns {{ PP:number, OPP:number, DPP:number, dps:number, ehp:number }}
 */
export function getCurrentPP(state) {
  const { OPP, DPP, dps, ehp } = computePP(state);
  return {
    OPP,
    DPP,
    dps,
    ehp,
    PP: W_O * OPP + W_D * DPP,
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
