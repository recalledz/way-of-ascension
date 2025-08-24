import { REALMS } from './data/realms.js';
import { LAWS } from './data/laws.js';
import { progressionState } from './state.js';
import { getWeaponProficiencyBonuses } from '../proficiency/selectors.js';
import { getBuildingBonuses } from '../sect/selectors.js';
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
  const baseQi = realm.cap;
  const stageMultiplier = 1 + (state.realm.stage - 1) * 0.12;
  const lawBonuses = getLawBonuses(state);
  const building = getBuildingBonuses(state).qiCapMult || 0;
  return Math.floor(baseQi * stageMultiplier * (1 + state.qiCapMult + building) * lawBonuses.qiCap);
}

export function qiRegenPerSec(state = progressionState){
  const lawBonuses = getLawBonuses(state);
  const building = getBuildingBonuses(state).qiRegenMult || 0;
  return (REALMS[state.realm.tier].baseRegen + karmaQiRegenBonus(state)) * (1 + state.qiRegenMult + building) * lawBonuses.qiRegen;
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
  const comprehensionMult = 1 + (state.stats.comprehension - 10) * 0.05;
  const cultivationMult = state.cultivation.talent * comprehensionMult * state.cultivation.foundationMult;
  const lawBonuses = getLawBonuses(state);
  const lawMult = lawBonuses.foundationMult || 1;
  const bonuses = getBuildingBonuses(state);
  const buildingMult = state.cultivation.buildingMult * (1 + (bonuses.foundationMult || 0));
  const pillMult = state.cultivation.pillMult;
  return baseGain * cultivationMult * lawMult * buildingMult * pillMult;
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
  const realm = REALMS[state.realm.tier];
  const baseAtk = realm.atk;
  const stageBonus = Math.floor(baseAtk * (state.realm.stage - 1) * 0.08);
  const lawBonuses = getLawBonuses(state);
  const profBonus = getWeaponProficiencyBonuses(state).damage;
  const building = getBuildingBonuses(state).atkBase || 0;
  return Math.floor((state.atkBase + building + profBonus + state.tempAtk + baseAtk + stageBonus + karmaAtkBonus(state)) * lawBonuses.atk);
}

export function calcArmor(state = progressionState){
  const realm = REALMS[state.realm.tier];
  const baseArmor = realm.armor;
  const stageBonus = Math.floor(baseArmor * (state.realm.stage - 1) * 0.08);
  const lawBonuses = getLawBonuses(state);
  const building = getBuildingBonuses(state).armorBase || 0;
  return Math.floor((state.armorBase + building + state.tempArmor + baseArmor + stageBonus + karmaArmorBonus(state)) * lawBonuses.armor);
}

export function getStatEffects(state = progressionState) {
  return {
    spellPowerMult: 1 + (state.stats.mind - 10) * 0.06,
    alchemySuccessMult: 1 + (state.stats.mind - 10) * 0.04,
    learningSpeedMult: 1 + (state.stats.mind - 10) * 0.05,
    attackSpeedMult: 1 + (state.stats.dexterity - 10) * 0.04,
    cooldownReductionBonus: (state.stats.dexterity - 10) * 0.02,
    craftingSpeedMult: 1 + (state.stats.dexterity - 10) * 0.03,
    adventureSpeedMult: 1 + (state.stats.dexterity - 10) * 0.03,
    foundationGainMult: 1 + (state.stats.comprehension - 10) * 0.05,
    learningSpeedMult2: 1 + (state.stats.comprehension - 10) * 0.04,
    totalCritChance: state.stats.criticalChance + (state.stats.dexterity - 10) * 0.005,
    totalAttackSpeed: state.stats.attackSpeed * (1 + (state.stats.dexterity - 10) * 0.04),
    totalCooldownReduction: state.stats.cooldownReduction + (state.stats.dexterity - 10) * 0.02,
    totalAdventureSpeed: state.stats.adventureSpeed * (1 + (state.stats.dexterity - 10) * 0.03)
  };
}

export function calculatePlayerCombatAttack(state = progressionState) {
  const baseAttack = 5;
  const realmBonus = REALMS[state.realm.tier].atk * state.realm.stage;
  const profBonus = getWeaponProficiencyBonuses(state).damage;
  return baseAttack + profBonus + realmBonus;
}

export function calculatePlayerAttackRate(state = progressionState) {
  const baseRate = 1.0;
  const dexterityBonus = (state.stats.dexterity - 10) * 0.05;
  const attackSpeedBonus = state.stats.attackSpeed || 0;
  const profBonus = getWeaponProficiencyBonuses(state).speed;
  return baseRate + dexterityBonus + (attackSpeedBonus / 100) + profBonus;
}

export function breakthroughChance(state = progressionState){
  if(state.qi < qCap(state)*0.99 || state.foundation < fCap(state)*0.99) return 0;

  const realm = REALMS[state.realm.tier];
  let base = realm.bt;

  const stageMultiplier = 1 - (state.realm.stage - 1) * 0.05;
  const realmPenalty = state.realm.tier * 0.02;

  base = base * stageMultiplier - realmPenalty;

  const ward = state.pills.ward>0 ? 0.15 : 0;
  const alchemyBonus = getAlchemySuccessBonus(state) * 0.1;
  const cookingBonus = getCookingSuccessBonus(state) * 0.1;
  const buildingBonus = getBuildingBonuses(state).breakthroughBonus || 0;
  const cultivationBonus = (state.cultivation.talent - 1) * 0.1;

  const totalChance = base + ward + cookingBonus + buildingBonus + cultivationBonus;

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

