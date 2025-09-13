import { progressionState } from './state.js';
import { REALMS } from './data/realms.js';
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
  getCultivationPower as calcCultivationPower,
  getStatEffects as calcStatEffects,
  calculatePlayerCombatAttack as calcPlayerCombatAttack,
  calculatePlayerAttackSnapshot as calcPlayerAttackSnapshot,
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

export function calcArmor(state = progressionState, gearArmor = 0) {
  return calcCalcArmor(state, gearArmor);
}

export function getCultivationPower(state = progressionState) {
  return calcCultivationPower(state);
}

export function getStatEffects(state = progressionState) {
  return calcStatEffects(state);
}

export function calculatePlayerAttackSnapshot(state = progressionState) {
  const snap = calcPlayerAttackSnapshot(state);
  const mult = getTunable('combat.damageMult', 1);
  return {
    ...snap,
    profile: {
      phys: snap.profile.phys * mult,
      elems: Object.fromEntries(
        Object.entries(snap.profile.elems).map(([k, v]) => [k, v * mult])
      ),
    },
  };
}

export function calculatePlayerCombatAttack(state = progressionState) {
  const profile = calcPlayerCombatAttack(state);
  const mult = getTunable('combat.damageMult', 1);
  return {
    phys: profile.phys * mult,
    elems: Object.fromEntries(
      Object.entries(profile.elems).map(([k, v]) => [k, v * mult])
    ),
  };
}

export function calculatePlayerAttackRate(state = progressionState) {
  return calcPlayerAttackRate(state) * getTunable('combat.attackRateMult', 1);
}

export function breakthroughChance(state = progressionState) {
  return calcBreakthroughChance(state);
}

export function mortalStage(state = progressionState) {
  const slice = state.progression || state;
  const realm = slice.realm || {};
  if ((realm.tier ?? 0) > 0) return REALMS[0]?.stages || 0;
  return realm.stage || 0;
}

export function realmStage(state = progressionState) {
  const slice = state.progression || state;
  return slice.realm?.stage || 0;
}

export function isQiRefiningReached(state = progressionState) {
  const slice = state.progression || state;
  return (slice.realm?.tier ?? 0) >= 1;
}

export function isNodeUnlocked(id, state = progressionState) {
  const slice = state.progression || state;
  let set = slice.astralUnlockedNodes;
  if (!set) {
    try {
      const arr = JSON.parse(localStorage.getItem('astralTreeAllocated') || '[]');
      set = new Set(arr);
    } catch {
      set = new Set();
    }
    slice.astralUnlockedNodes = set;
  }
  if (set instanceof Set) return set.has(id);
  if (Array.isArray(set)) return set.includes(id);
  return false;
}
