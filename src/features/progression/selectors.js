import { progressionState } from './state.js';
import { getTunable } from '../../shared/tunables.js';
import {
  getLawBonuses as calcLawBonuses,
  qCap as calcQCap,
  qiRegenPerSec as calcQiRegen,
  fCap as calcFCap,
  foundationGainPerSec as calcFoundationGain,
  foundationGainPerMeditate as calcFoundationGainMeditate,
  powerMult as calcPowerMult,
  calcAtk as calcCalcAtk,
  calcArmor as calcCalcArmor,
  getStatEffects as calcStatEffects,
  calculatePlayerCombatAttack as calcPlayerCombatAttack,
  calculatePlayerAttackRate as calcPlayerAttackRate,
  breakthroughChance as calcBreakthroughChance,
} from './logic.js';

export { clamp } from './logic.js';

export function getLawBonuses(state = progressionState) {
  return calcLawBonuses(state);
}

export function qCap(state = progressionState) {
  return calcQCap(state);
}

export function qiRegenPerSec(state = progressionState) {
  return calcQiRegen(state) * getTunable('progression.qiRegenMult', 1);
}

export function fCap(state = progressionState) {
  return calcFCap(state);
}

export function foundationGainPerSec(state = progressionState) {
  return calcFoundationGain(state) * getTunable('progression.foundationGainMult', 1);
}

export function foundationGainPerMeditate(state = progressionState) {
  return calcFoundationGainMeditate(state) * getTunable('progression.foundationGainMult', 1);
}

export function powerMult(state = progressionState) {
  return calcPowerMult(state);
}

export function calcAtk(state = progressionState) {
  return calcCalcAtk(state);
}

export function calcArmor(state = progressionState) {
  return calcCalcArmor(state);
}

export function getStatEffects(state = progressionState) {
  return calcStatEffects(state);
}

export function calculatePlayerCombatAttack(state = progressionState) {
  const profile = calcPlayerCombatAttack(state);
  const mult = getTunable('combat.damageMult', 1);
  const scaledElems = {};
  for (const [elem, val] of Object.entries(profile.elems || {})) {
    scaledElems[elem] = val * mult;
  }
  return { phys: profile.phys * mult, elems: scaledElems };
}

export function calculatePlayerAttackRate(state = progressionState) {
  return calcPlayerAttackRate(state) * getTunable('combat.attackRateMult', 1);
}

export function breakthroughChance(state = progressionState) {
  return calcBreakthroughChance(state);
}
