import { REALMS } from '../../data/realms.js';
import { LAWS } from '../../data/laws.js';
import { S } from './state.js';
import { getProficiency } from './systems/proficiency.js';
import { getEquippedWeapon } from './combat.js';
import { WEAPONS } from '../data/weapons.js';

export const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

export function getLawBonuses(){
  let bonuses = {
    atk: 1, def: 1, qiRegen: 1, qiCap: 1, resourceYield: 1,
    alchemySuccess: 1, pillEffect: 1, critChance: 0, dmgReduction: 0,
    beastDmg: 1, herbYield: 1, pillQiBonus: 1, qiCost: 1
  };

  if(!S.laws || !S.laws.selected) return bonuses;

  const law = LAWS[S.laws.selected];
  const tree = S.laws.trees[S.laws.selected];

  if(law.bonuses.atk) bonuses.atk *= law.bonuses.atk;
  if(law.bonuses.def) bonuses.def *= law.bonuses.def;
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
      if(bonus.def) bonuses.def *= (1 + bonus.def);
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

export function qCap(){
  const realm = REALMS[S.realm.tier];
  const baseQi = realm.cap;
  const stageMultiplier = 1 + (S.realm.stage - 1) * 0.12;
  const lawBonuses = getLawBonuses();
  return Math.floor(baseQi * stageMultiplier * (1 + S.qiCapMult) * lawBonuses.qiCap);
}

export function qiRegenPerSec(){
  const lawBonuses = getLawBonuses();
  return (REALMS[S.realm.tier].baseRegen + S.karma.qiRegen*10) * (1 + S.qiRegenMult) * lawBonuses.qiRegen;
}

export function fCap(){
  const realm = REALMS[S.realm.tier];
  const baseFoundation = realm.fcap;
  const stageMultiplier = 1 + (S.realm.stage - 1) * 0.15;
  return Math.floor(baseFoundation * stageMultiplier);
}

export function foundationGainPerSec(){
  const baseGain = qiRegenPerSec() * 0.8;
  if (!S.cultivation) {
    S.cultivation = {
      talent: 1.0,
      foundationMult: 1.0,
      pillMult: 1.0,
      buildingMult: 1.0
    };
  }
  if (!S.stats) {
    S.stats = {
      physique: 10, mind: 10, agility: 10, dexterity: 10, comprehension: 10,
      criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
    };
  }
  const comprehensionMult = 1 + (S.stats.comprehension - 10) * 0.05;
  const cultivationMult = S.cultivation.talent * comprehensionMult * S.cultivation.foundationMult;
  const lawBonuses = getLawBonuses();
  const lawMult = lawBonuses.foundationMult || 1;
  const buildingMult = S.cultivation.buildingMult;
  const pillMult = S.cultivation.pillMult;
  return baseGain * cultivationMult * lawMult * buildingMult * pillMult;
}

export function foundationGainPerMeditate(){
  return foundationGainPerSec() * 2.5;
}

export function powerMult(){
  const tier = S.realm.tier;
  const realmPower = REALMS[tier].power;
  const stageMult = 1 + (S.realm.stage - 1) * 0.1;
  return realmPower * stageMult;
}

export function calcAtk(){
  const realm = REALMS[S.realm.tier];
  const baseAtk = realm.atk;
  const stageBonus = Math.floor(baseAtk * (S.realm.stage - 1) * 0.08);
  if (!S.stats) {
    S.stats = {
      physique: 10, mind: 10, agility: 10, dexterity: 10, comprehension: 10,
      criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
    };
  }
  const physiqueMult = 1 + (S.stats.physique - 10) * 0.05;
  const lawBonuses = getLawBonuses();
  const profBonus = getWeaponProficiencyBonuses().damage;
  return Math.floor((S.atkBase + profBonus + S.tempAtk + baseAtk + stageBonus + S.karma.atk*100) * lawBonuses.atk * physiqueMult);
}

export function calcDef(){
  const realm = REALMS[S.realm.tier];
  const baseDef = realm.def;
  const stageBonus = Math.floor(baseDef * (S.realm.stage - 1) * 0.08);
  if (!S.stats) {
    S.stats = {
      physique: 10, mind: 10, agility: 10, dexterity: 10, comprehension: 10,
      criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
    };
  }
  const physiqueMult = 1 + (S.stats.physique - 10) * 0.03;
  const lawBonuses = getLawBonuses();
  return Math.floor((S.defBase + S.tempDef + baseDef + stageBonus + S.karma.def*100) * lawBonuses.def * physiqueMult);
}

export function getStatEffects() {
  if (!S.stats) {
    S.stats = {
      physique: 10, mind: 10, agility: 10, dexterity: 10, comprehension: 10,
      criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
    };
  }
  return {
    physicalDamageMult: 1 + (S.stats.physique - 10) * 0.05,
    physicalDefenseMult: 1 + (S.stats.physique - 10) * 0.03,
    miningYieldMult: 1 + (S.stats.physique - 10) * 0.03,
    spellPowerMult: 1 + (S.stats.mind - 10) * 0.06,
    alchemySuccessMult: 1 + (S.stats.mind - 10) * 0.04,
    learningSpeedMult: 1 + (S.stats.mind - 10) * 0.05,
    attackSpeedMult: 1 + (S.stats.dexterity - 10) * 0.04,
    cooldownReductionBonus: (S.stats.dexterity - 10) * 0.02,
    craftingSpeedMult: 1 + (S.stats.dexterity - 10) * 0.03,
    adventureSpeedMult: 1 + (S.stats.dexterity - 10) * 0.03,
    foundationGainMult: 1 + (S.stats.comprehension - 10) * 0.05,
    learningSpeedMult2: 1 + (S.stats.comprehension - 10) * 0.04,
    totalCritChance: S.stats.criticalChance + (S.stats.dexterity - 10) * 0.005,
    totalAttackSpeed: S.stats.attackSpeed * (1 + (S.stats.dexterity - 10) * 0.04),
    totalCooldownReduction: S.stats.cooldownReduction + (S.stats.dexterity - 10) * 0.02,
    totalAdventureSpeed: S.stats.adventureSpeed * (1 + (S.stats.dexterity - 10) * 0.03)
  };
}

export function getWeaponProficiencyBonuses(state = S) {
  const weaponKey = getEquippedWeapon(state);
  const weapon = WEAPONS[weaponKey] || WEAPONS.fist;
  const { value } = getProficiency(weapon.proficiencyKey, state);
  const level = Math.floor(value / 100);
  return {
    damage: level,
    speed: level * 0.01,
  };
}

export function calculatePlayerCombatAttack() {
  const baseAttack = 5;
  const physiqueBonus = Math.floor((S.stats.physique - 10) * 2);
  const realmBonus = REALMS[S.realm.tier].atk * S.realm.stage;
  const profBonus = getWeaponProficiencyBonuses().damage;
  return baseAttack + profBonus + physiqueBonus + realmBonus;
}

export function calculatePlayerAttackRate() {
  const baseRate = 1.0;
  const dexterityBonus = (S.stats.dexterity - 10) * 0.05;
  const attackSpeedBonus = S.stats.attackSpeed || 0;
  const profBonus = getWeaponProficiencyBonuses().speed;
  return baseRate + dexterityBonus + (attackSpeedBonus / 100) + profBonus;
}

export function breakthroughChance(){
  if(S.qi < qCap()*0.99 || S.foundation < fCap()*0.99) return 0;

  const realm = REALMS[S.realm.tier];
  let base = realm.bt;

  const stageMultiplier = 1 - (S.realm.stage - 1) * 0.05;
  const realmPenalty = S.realm.tier * 0.02;

  base = base * stageMultiplier - realmPenalty;

  const ward = S.pills.ward>0 ? 0.15 : 0;
  const alchemyBonus = S.alchemy.successBonus * 0.1;
  const buildingBonus = S.buildingBonuses.breakthroughBonus || 0;
  const cultivationBonus = (S.cultivation.talent - 1) * 0.1;

  const totalChance = base + ward + alchemyBonus + buildingBonus + cultivationBonus;

  return clamp(totalChance, 0.01, 0.95);
}
