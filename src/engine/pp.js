import { calcArmor, calculatePlayerAttackSnapshot } from '../features/progression/logic.js';
import { REALMS } from '../features/progression/data/realms.js';
import {
  drFromArmor,
  dEhpFromHP,
  dEhpFromDodge,
  dEhpFromRes,
  dEhpFromQiRegenPct,
  dEhpFromMaxQiPct,
} from '../lib/power/ehp.js';

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
export function computePP(state, opts = {}) {
  const snap = calculatePlayerAttackSnapshot(state);
  const combinePct = elem =>
    (snap.gearPct?.all || 0) +
    (snap.gearPct?.[elem] || 0) +
    (snap.astralPct?.[elem] || 0) +
    (snap.globalPct || 0);

  let OPP = snap.profile.phys * (1 + combinePct('physical'));
  for (const [elem, dmg] of Object.entries(snap.profile.elems || {})) {
    OPP += dmg * (1 + combinePct(elem));
  }
  OPP *= 1 + (snap.critChance || 0) * ((snap.critMult || 1) - 1);

  OPP *= 1 + (snap.power?.opFromCult || 0);

  const baseArmor = opts.armor ?? state.derivedStats?.armor ?? calcArmor(state);
  const baseHP = opts.hp ?? state.hpMax || state.hp || 0;
  const dodge = opts.dodge ?? state.derivedStats?.dodge || 0;
  const resists = opts.resists ?? state.resists || {};
  const qiRegenPct = opts.qiRegenPct ?? (state.qiRegenMult || 0) + (state.gearBonuses?.qiRegenMult || 0);
  const maxQiPct = opts.maxQiPct ?? ((state.astralTreeBonuses?.maxQiPct || 0) / 100) + (state.qiCapMult || 0);

  let dpp = 0;
  dpp += dEhpFromHP(baseHP);
  const armorDR = drFromArmor(baseArmor);
  dpp += dEhpFromRes(armorDR);
  dpp += dEhpFromDodge(dodge / 100);
  for (const val of Object.values(resists)) {
    dpp += dEhpFromRes(val);
  }
  dpp += dEhpFromQiRegenPct(qiRegenPct);
  dpp += dEhpFromMaxQiPct(maxQiPct);
  const DPP = dpp * 100 * W_D;
  return { OPP, DPP };
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
  const beforePP = W_O * before.OPP + before.DPP;

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
  const afterPP = W_O * after.OPP + after.DPP;
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
