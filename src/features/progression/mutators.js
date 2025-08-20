import { progressionState } from './state.js';
import { REALMS } from './data/realms.js';
import { LAWS } from './data/laws.js';
import { log } from '../../game/utils.js';

export function advanceRealm(state = progressionState) {
  const wasRealmAdvancement = state.realm.stage > REALMS[state.realm.tier].stages;
  const oldRealm = state.realm.tier;

  state.realm.stage++;
  if (state.realm.stage > REALMS[state.realm.tier].stages) {
    state.realm.tier++;
    state.realm.stage = 1;
  }

  const currentRealm = REALMS[state.realm.tier];
  log?.(`Advanced to ${currentRealm.name} ${state.realm.stage}!`, 'good');

  if (wasRealmAdvancement) {
    const realmBonus = Math.max(1, Math.floor(state.realm.tier * 1.5));
    state.atkBase += realmBonus * 2;
    state.defBase += realmBonus;
    state.hpMax += Math.floor(state.hpMax * 0.25);
    state.hp = state.hpMax;

    state.cultivation = state.cultivation || { talent: 1.0, foundationMult: 1.0, pillMult: 1.0, buildingMult: 1.0 };
    state.stats = state.stats || {
      physique: 10, mind: 10, dexterity: 10, comprehension: 10,
      criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0,
      armor: 0, accuracy: 0, dodge: 0
    };

    state.cultivation.talent += 0.15;
    state.cultivation.foundationMult += 0.08;

    const realmStatPoints = 3 + state.realm.tier;
    state.stats.physique += Math.ceil(realmStatPoints * 0.3);
    state.stats.mind += Math.ceil(realmStatPoints * 0.25);
    state.stats.dexterity += Math.ceil(realmStatPoints * 0.25);
    state.stats.comprehension += Math.ceil(realmStatPoints * 0.2);
    state.stats.criticalChance += 0.01;

    const powerGain = currentRealm.power / REALMS[oldRealm].power;
    log?.(`Realm breakthrough! Power increased by ${powerGain.toFixed(1)}x! ATK +${realmBonus * 2}, DEF +${realmBonus}, HP +25%`, 'good');
    log?.(`Cultivation enhanced! Talent +15%, Comprehension +10%, Foundation Mult +8%`, 'good');
  } else {
    const stageBonus = Math.max(1, Math.floor((state.realm.tier + 1) * 0.5));
    state.atkBase += stageBonus;
    state.defBase += Math.floor(stageBonus * 0.7);
    state.hpMax += Math.floor(state.hpMax * 0.08);
    state.hp = Math.min(state.hpMax, state.hp + Math.floor(state.hpMax * 0.5));

    state.cultivation = state.cultivation || { talent: 1.0, foundationMult: 1.0, pillMult: 1.0, buildingMult: 1.0 };
    state.stats = state.stats || {
      physique: 10, mind: 10, dexterity: 10, comprehension: 10,
      criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0,
      armor: 0, accuracy: 0, dodge: 0
    };

    state.cultivation.talent += 0.03;

    const stageStatPoints = 1 + Math.floor(state.realm.tier * 0.5);
    const statDistribution = Math.random();
    if (statDistribution < 0.4) {
      state.stats.physique += stageStatPoints;
    } else if (statDistribution < 0.7) {
      state.stats.comprehension += stageStatPoints;
    } else if (statDistribution < 0.85) {
      state.stats.mind += stageStatPoints;
    } else {
      state.stats.dexterity += stageStatPoints;
    }

    log?.(`Stage breakthrough! ATK +${stageBonus}, DEF +${Math.floor(stageBonus * 0.7)}, HP +8%`, 'good');
    log?.(`Cultivation improved! Talent +3%, Comprehension +2%`, 'good');
  }

  checkLawUnlocks(state);
  awardLawPoints(state);
}

export function checkLawUnlocks(state = progressionState) {
  for (const lawKey in LAWS) {
    const law = LAWS[lawKey];
    if (!state.laws.unlocked.includes(lawKey)) {
      if (state.realm.tier >= law.unlockReq.realm && state.realm.stage >= law.unlockReq.stage) {
        state.laws.unlocked.push(lawKey);
        log?.(`${law.name} is now available for selection!`, 'good');
      }
    }
  }
}

export function awardLawPoints(state = progressionState) {
  let points = 0;
  if (state.realm.tier >= 2) points += 2;
  if (state.realm.tier >= 3) points += 3;
  if (state.realm.tier >= 4) points += 5;

  if (state.realm.stage === 1 && state.realm.tier > 0) points += state.realm.tier;
  if (state.realm.stage === 5) points += 1;
  if (state.realm.stage === 9) points += 2;

  if (points > 0) {
    state.laws.points += points;
    log?.(`Gained ${points} Law Points!`, 'good');
  }
}

export function selectLaw(lawKey, state = progressionState) {
  if (!state.laws.unlocked.includes(lawKey)) return;
  state.laws.selected = lawKey;
}
