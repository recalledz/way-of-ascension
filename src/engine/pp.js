import { calcAtk, calcArmor } from '../features/progression/logic.js';
import { REALMS } from '../features/progression/data/realms.js';

/**
 * Basic player power calculations. OPP (Offensive Power Points) and DPP
 * (Defensive Power Points) are derived from the player's current attack and
 * armor values. PP represents the total power.
 *
 * @param {object} state Player or global state object
 * @returns {{ opp: number, dpp: number, pp: number }}
 */
export function computePP(state) {
  const opp = calcAtk(state);
  const dpp = calcArmor(state);
  const pp = opp + dpp;
  return { opp, dpp, pp };
}

/**
 * Create a snapshot of current and post-breakthrough power points.
 * Simulates the next realm/stage advancement and compares the resulting
 * Offensive/Defensive/total Power Points.
 *
 * @param {object} state Player state
 * @returns {{ before:{opp:number,dpp:number,pp:number}, after:{opp:number,dpp:number,pp:number}, diff:{opp:number,dpp:number,pp:number} }}
 */
export function breakthroughPPSnapshot(state) {
  const before = computePP(state);

  // Deep clone relevant pieces to simulate the breakthrough
  const sim = JSON.parse(JSON.stringify(state));

  // Determine if the next breakthrough advances the realm or just the stage
  const stages = REALMS[sim.realm.tier].stages;
  if (sim.realm.stage >= stages) {
    // Realm advancement
    sim.realm.tier++;
    sim.realm.stage = 1;
    const realmBonus = Math.max(1, Math.floor(sim.realm.tier * 1.5));
    sim.atkBase += realmBonus * 2;
    sim.armorBase += realmBonus;
  } else {
    // Stage advancement
    sim.realm.stage++;
    const stageBonus = Math.max(1, Math.floor((sim.realm.tier + 1) * 0.5));
    sim.atkBase += stageBonus;
    sim.armorBase += Math.floor(stageBonus * 0.7);
  }

  const after = computePP(sim);
  const diff = {
    opp: after.opp - before.opp,
    dpp: after.dpp - before.dpp,
    pp: after.pp - before.pp,
  };

  return { before, after, diff };
}
