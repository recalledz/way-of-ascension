import { calcArmor, calculatePlayerAttackSnapshot } from '../features/progression/logic.js';
import { REALMS } from '../features/progression/data/realms.js';

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
export function computePP(state) {
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

  const baseArmor = state.derivedStats?.armor ?? calcArmor(state);
  const baseHP = state.hpMax || state.hp || 0;
  const DPP = (baseHP + baseArmor) * (1 + (snap.power?.dpFromCult || 0));
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
