import { REALMS } from './data/realms.js';
import { LAWS } from './data/laws.js';
import { progressionState } from './state.js';
import { getWeaponProficiencyBonuses } from '../proficiency/selectors.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { karmaQiRegenBonus, karmaAtkBonus, karmaArmorBonus } from '../karma/logic.js';
import { getSuccessBonus as getAlchemySuccessBonus } from '../alchemy/selectors.js';
import { getCookingSuccessBonus } from '../cooking/selectors.js';
export const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
export function getLawBonuses(state = progressionState){
  let bonuses = {
    atk: 1, armor: 1, qiRegen: 1, qiCap: 1, resourceYield: 1,
    alchemySuccess: 1, pillEffect: 1, critChance: 0, dmgReduction: 0,
    beastDmg: 1, herbYield: 1, pillQiBonus: 1, qiCost: 1
  };

  if(!state.laws || !state.laws.selected) return bonuses;

  const law = LAWS[state.laws.selected];
  const tree = state.laws.trees[state.laws.selected];

  if(law.bonuses.atk) bonuses.atk *= law.bonuses.atk;
  if(law.bonuses.armor) bonuses.armor *= law.bonuses.armor;
  if(law.bonuses.qiRegen) bonuses.qiRegen *= law.bonuses.qiRegen;
  if(law.bonuses.resourceYield) bonuses.resourceYield *= law.bonuses.resourceYield;
  if(law.bonuses.alchemySuccess) bonuses.alchemySuccess *= law.bonuses.alchemySuccess;
  if(law.bonuses.pillEffectiveness) bonuses.pillEffect *= law.bonuses.pillEffectiveness;
  if(law.bonuses.critChance) bonuses.critChance += law.bonuses.critChance;

  for(const skillKey in tree){
    if(tree[skillKey]){
      const skill = law.tree[skillKey];
      const bonus = skill.bonus;
      if(bonus.atk) bonuses.atk *= (1 + bonus.atk);
      if(bonus.armor) bonuses.armor *= (1 + bonus.armor);
      if(bonus.qiRegen) bonuses.qiRegen *= (1 + bonus.qiRegen);
      if(bonus.qiCap) bonuses.qiCap *= (1 + bonus.qiCap);
      if(bonus.resourceYield) bonuses.resourceYield *= (1 + bonus.resourceYield);
      if(bonus.alchemySuccess) bonuses.alchemySuccess *= (1 + bonus.alchemySuccess);
      if(bonus.pillEffect) bonuses.pillEffect *= (1 + bonus.pillEffect);
      if(bonus.critChance) bonuses.critChance += bonus.critChance;
      if(bonus.dmgReduction) bonuses.dmgReduction += bonus.dmgReduction;
      if(bonus.beastDmg) bonuses.beastDmg *= (1 + bonus.beastDmg);
      if(bonus.herbYield) bonuses.herbYield *= (1 + bonus.herbYield);
      if(bonus.pillQiBonus) bonuses.pillQiBonus *= (1 + bonus.pillQiBonus);
      if(bonus.qiCost) bonuses.qiCost *= (1 + bonus.qiCost);
    }
  }

  return bonuses;
}

export function qCap(state = progressionState){
  const realm = REALMS[state.realm.tier];
  const baseQi = realm.cap + (state.astralTreeBonuses?.maxQi || 0);
  const stageMultiplier = 1 + (state.realm.stage - 1) * 0.12;
  const lawBonuses = getLawBonuses(state);
  const astralPct = (state.astralTreeBonuses?.maxQiPct || 0) / 100;
  return Math.floor(baseQi * stageMultiplier * (1 + state.qiCapMult) * lawBonuses.qiCap * (1 + astralPct));
}

export function qiRegenPerSec(state = progressionState){
  const lawBonuses = getLawBonuses(state);
  const gear = state.gearBonuses?.qiRegenMult || 0;
  return (REALMS[state.realm.tier].baseRegen + karmaQiRegenBonus(state)) * (1 + state.qiRegenMult  + gear) * lawBonuses.qiRegen;
}

export function fCap(state = progressionState){
  const realm = REALMS[state.realm.tier];
  const baseFoundation = realm.fcap;
  const stageMultiplier = 1 + (state.realm.stage - 1) * 0.15;
  return Math.floor(baseFoundation * stageMultiplier);
}

export function foundationGainPerSec(state = progressionState){
  const baseGain = qiRegenPerSec(state) * 0.8;
  if (!state.cultivation) {
    state.cultivation = {
      talent: 1.0,
      foundationMult: 1.0,
      pillMult: 1.0,
      buildingMult: 1.0
    };
  }
  const comp = Number(state.attributes?.comprehension ?? 10);
  const comprehensionMult = 1 + (comp - 10) * 0.05;
  const cultivationMult = state.cultivation.talent * comprehensionMult * state.cultivation.foundationMult;
  const lawBonuses = getLawBonuses(state);
  const lawMult = lawBonuses.foundationMult || 1;
  const buildingMult = state.cultivation.buildingMult;
  const pillMult = state.cultivation.pillMult;
  const gear = state.gearBonuses?.foundationMult || 0;
  return baseGain * cultivationMult * lawMult * pillMult * (1 + gear);
}

export function foundationGainPerMeditate(state = progressionState){
  return foundationGainPerSec(state) * 2.5;
}

export function powerMult(state = progressionState){
  const tier = state.realm.tier;
  const realmPower = REALMS[tier].power;
  const stageMult = 1 + (state.realm.stage - 1) * 0.1;
  return realmPower * stageMult;
}

export function calcAtk(state = progressionState){
  const tier = state?.realm?.tier ?? 0;
  const stage = state?.realm?.stage ?? 1;
  const realm = REALMS[tier] || {};
  const baseAtk = Number(realm.atk) || 0;
  const stageBonus = Math.floor(baseAtk * (stage - 1) * 0.08);
  const lawBonuses = getLawBonuses(state);
  const profMult = Number(getWeaponProficiencyBonuses(state).damageMult) || 1;
  const base = Number(state.atkBase) || 0;
  const temp = Number(state.tempAtk) || 0;
  const karma = Number(karmaAtkBonus(state)) || 0;
  return Math.floor((base + temp + baseAtk + stageBonus + karma) * profMult * (lawBonuses.atk || 1));
}

export function calcArmor(state = progressionState){
  const tier = state?.realm?.tier ?? 0;
  const stage = state?.realm?.stage ?? 1;
  const realm = REALMS[tier] || {};
  const baseArmor = Number(realm.armor) || 0;
  const stageBonus = Math.floor(baseArmor * (stage - 1) * 0.08);
  const lawBonuses = getLawBonuses(state);
  const base = Number(state.armorBase) || 0;
  const temp = Number(state.tempArmor) || 0;
  const karma = Number(karmaArmorBonus(state)) || 0;
  const astral = 1 + (state.astralTreeBonuses?.armorPct || 0) / 100;
  return Math.floor(
    (base + temp + baseArmor + stageBonus + karma) *
      (lawBonuses.armor || 1) *
      astral
  );
}

export function getStatEffects(state = progressionState) {
  const stats = state.attributes || {};
  const mind = Number(stats.mind) || 10;
  const comp = Number(stats.comprehension) || 10;
  const crit = Number(stats.criticalChance) || 0;
  const atkSpd = Number(stats.attackSpeed) || 0;
  const cdRed = Number(stats.cooldownReduction) || 0;
  const advSpd = Number(stats.adventureSpeed) || 0;
  return {
    spellPowerMult: 1 + (mind - 10) * 0.06,
    alchemySuccessMult: 1 + (mind - 10) * 0.04,
    learningSpeedMult: 1 + (mind - 10) * 0.05,
    attackSpeedMult: 1,
    cooldownReductionBonus: 0,
    craftingSpeedMult: 1,
    adventureSpeedMult: 1,
    foundationGainMult: 1 + (comp - 10) * 0.05,
    learningSpeedMult2: 1 + (comp - 10) * 0.04,
    totalCritChance: crit,
    totalAttackSpeed: atkSpd,
    totalCooldownReduction: cdRed,
    totalAdventureSpeed: advSpd
  };
}

export function calculatePlayerCombatAttack(state = progressionState) {
  const weapon = getEquippedWeapon(state);
  const physBase = weapon?.base?.phys || { min: 0, max: 0 };
  const basePhys = (physBase.min + physBase.max) / 2;

  const elems = {};
  for (const [elem, range] of Object.entries(weapon?.base?.elems || {})) {
    elems[elem] = (range.min + range.max) / 2;
  }

  return { phys: basePhys, elems };
}

export function calculatePlayerAttackSnapshot(state = progressionState) {
  const profile = calculatePlayerCombatAttack(state);

  const astralPct = {};
  for (const [key, val] of Object.entries(state.astralTreeBonuses || {})) {
    if (key.endsWith('DamagePct')) {
      const elem = key === 'physicalDamagePct' ? 'physical' : key.replace('DamagePct', '');
      astralPct[elem] = (val || 0) / 100;
    }
  }

  const gearPct = {};
  const profBonus = getWeaponProficiencyBonuses(state).damageMult - 1;
  if (profBonus) gearPct.all = profBonus;

  const critChance = Number(state.attributes?.criticalChance) || 0;
  const critMult = 2;

  return { profile, astralPct, gearPct, critChance, critMult, globalPct: 0 };
}

export function calculatePlayerAttackRate(state = progressionState) {
  const weapon = getEquippedWeapon(state);
  const baseRate = weapon?.base?.rate || 1;
  const attr = Number(state.attributes?.attackSpeed) || 0;
  const gear = Number(state.gearBonuses?.attackRatePct || state.gearBonuses?.attackSpeedPct || 0);
  const astral = Number(state.astralTreeBonuses?.attackSpeedPct || 0);
  const profMult = Number(getWeaponProficiencyBonuses(state).speedMult) || 1;
  const totalPct = attr + gear + astral + (profMult - 1) * 100;
  return baseRate * (1 + totalPct / 100);
}

export function breakthroughChance(state = progressionState){
  const realm = REALMS[state.realm.tier];
  let base = realm.bt;

  const stageMultiplier = 1 - (state.realm.stage - 1) * 0.05;
  const realmPenalty = state.realm.tier * 0.02;

  base = base * stageMultiplier - realmPenalty;

  const alchemyBonus = getAlchemySuccessBonus(state) * 0.1;
  const cookingBonus = getCookingSuccessBonus(state) * 0.1;
  const cultivationBonus = (state.cultivation.talent - 1) * 0.1;

  const gearBonus = state.gearBonuses?.breakthroughBonus || 0;
  const tempBonus = state.breakthroughBonus || 0;
  const mult = state.breakthroughChanceMult || 1;

  const totalChance = (base + cookingBonus + cultivationBonus + gearBonus + tempBonus + alchemyBonus) * mult;

  return clamp(totalChance, 0.01, 0.95);
}

export function canLearnSkill(lawKey, skillKey, state = progressionState) {
  const skill = LAWS[lawKey]?.tree?.[skillKey];
  if (!skill) return false;

  const learned = state.laws.trees[lawKey] || {};
  if (learned[skillKey]) return false;

  if (state.laws.points < skill.cost) return false;

  if (skill.prereq) {
    if (Array.isArray(skill.prereq)) {
      return skill.prereq.every(p => learned[p]);
    }
    return !!learned[skill.prereq];
  }

  return true;
}

