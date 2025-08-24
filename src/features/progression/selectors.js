import { progressionState } from './state.js';
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
  return calcQiRegen(state);
}

export function fCap(state = progressionState) {
  return calcFCap(state);
}

export function foundationGainPerSec(state = progressionState) {
  return calcFoundationGain(state);
}

export function foundationGainPerMeditate(state = progressionState) {
  return calcFoundationGainMeditate(state);
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
  return calcPlayerCombatAttack(state);
}

export function calculatePlayerAttackRate(state = progressionState) {
  return calcPlayerAttackRate(state);
}

export function breakthroughChance(state = progressionState) {
  return calcBreakthroughChance(state);
}
