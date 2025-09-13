import { calcAtk, calcArmor } from '../features/progression/logic.js';

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
