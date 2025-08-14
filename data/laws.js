export const LAWS = {
  sword: {
    name: 'Sword Law',
    desc: 'The path of the blade - focused on combat mastery and offensive techniques',
    icon: '⚔️',
    unlockReq: {realm: 2, stage: 1}, // Foundation 1
    bonuses: {atk: 1.2, critChance: 0.1, qiEfficiency: 0.9},
    tree: {
      'basic_sword': {name: 'Basic Sword Intent', desc: '+15% ATK, +5% crit chance', cost: 10, prereq: null, bonus: {atk: 0.15,critChance: 0.05}},
      'sharp_edge': {name: 'Sharp Edge', desc: '+20% ATK vs beasts', cost: 25, prereq: 'basic_sword', bonus: {beastDmg: 0.20}},
      'sword_qi': {name: 'Sword Qi Mastery', desc: '+30% Qi regen, techniques cost 10% less', cost: 40, prereq: 'basic_sword', bonus: {qiRegen: 0.30, qiCost: -0.10}},
      'cultivation_focus': {name: 'Cultivation Focus', desc: '+25% foundation gain, +10% cultivation talent', cost: 50, prereq:'sword_qi', bonus: {foundationMult: 0.25, cultivationTalent: 0.10}},
      'piercing_strike': {name: 'Piercing Strike', desc: 'Unlocks Piercing Strike technique', cost: 60, prereq: 'sharp_edge', bonus: {technique: 'piercing_strike'}},
      'sword_heart': {name: 'Sword Heart', desc: '+50% ATK, +15% crit chance, +20% foundation gain', cost: 100, prereq: ['cultivation_focus', 'piercing_strike'], bonus: {atk: 0.50, critChance: 0.15, foundationMult: 0.20}},
      'thousand_cuts': {name: 'Thousand Cuts', desc: 'Unlocks Thousand Cuts ultimate technique', cost: 200, prereq: 'sword_heart', bonus: {technique: 'thousand_cuts'}}
    }
  },
  formation: {
    name: 'Formation Law',
    desc: 'The art of arrays and defensive techniques - focused on protection and resource efficiency',
    icon: '🛡️',
    unlockReq: {realm: 2, stage: 1}, // Foundation 1
    bonuses: {def: 1.3, qiRegen: 1.1, resourceYield: 1.05},
    tree: {
      'basic_formation': {name: 'Basic Formation Theory', desc: '+20% DEF, +10% resource yield', cost: 10, prereq: null, bonus:{def: 0.20, resourceYield: 0.10}},
      'qi_gathering': {name: 'Qi Gathering Array', desc: '+25% Qi regen, +15% Qi cap', cost: 25, prereq: 'basic_formation', bonus: {qiRegen: 0.25, qiCap: 0.15}},
      'protective_ward': {name: 'Protective Ward', desc: '+30% DEF, reduces damage by 5%', cost: 40, prereq: 'basic_formation',bonus: {def: 0.30, dmgReduction: 0.05}},
      'meditation_array': {name: 'Meditation Array', desc: '+30% foundation gain, +15% comprehension', cost: 50, prereq: 'qi_gathering', bonus: {foundationMult: 0.30, comprehension: 0.15}},
      'spirit_lock': {name: 'Spirit Lock Formation', desc: 'Unlocks Spirit Lock technique', cost: 60, prereq: 'protective_ward', bonus: {technique: 'spirit_lock'}},
      'grand_array': {name: 'Grand Defensive Array', desc: '+40% DEF, +20% all yields, +25% foundation gain', cost: 100, prereq: ['meditation_array', 'spirit_lock'], bonus: {def: 0.40, resourceYield: 0.20, foundationMult: 0.25}},
      'heaven_earth': {name: 'Heaven-Earth Formation', desc: 'Unlocks Heaven-Earth ultimate technique', cost: 200, prereq: 'grand_array', bonus: {technique: 'heaven_earth'}}
    }
  },
  alchemy: {
    name: 'Alchemy Law',
    desc: 'The way of pills and elixirs - focused on enhancement and support abilities',
    icon: '🧪',
    unlockReq: {realm: 2, stage: 1}, // Foundation 1
    bonuses: {alchemySuccess: 1.2, pillEffectiveness: 1.15, qiRegen: 1.05},
    tree: {
      'basic_alchemy': {name: 'Basic Pill Theory', desc: '+15% alchemy success, +10% pill effects', cost: 10, prereq: null, bonus:{alchemySuccess: 0.15, pillEffect: 0.10}},
      'herb_mastery': {name: 'Herb Mastery', desc: '+30% herb yield, +1 alchemy slot', cost: 25, prereq: 'basic_alchemy', bonus: {herbYield: 0.30, alchemySlots: 1}},
      'qi_condensation': {name: 'Qi Condensation', desc: '+20% Qi from pills, +15% Qi regen', cost: 40, prereq: 'basic_alchemy', bonus: {pillQiBonus: 0.20, qiRegen: 0.15}},
      'pill_mastery': {name: 'Pill Mastery', desc: '+40% pill effectiveness, +20% foundation from pills', cost: 50, prereq: 'qi_condensation', bonus: {pillMult: 0.40, pillFoundation: 0.20}},
      'transmutation': {name: 'Transmutation Art', desc: 'Unlocks Transmutation technique', cost: 60, prereq: 'herb_mastery', bonus: {technique: 'transmutation'}},
      'master_alchemist': {name: 'Master Alchemist', desc: '+25% success, +20% pill effects, +1 slot, +15% comprehension', cost: 100, prereq: ['pill_mastery', 'transmutation'], bonus: {alchemySuccess: 0.25, pillEffect: 0.20, alchemySlots: 1, comprehension: 0.15}},
      'immortal_elixir': {name: 'Immortal Elixir', desc: 'Unlocks Immortal Elixir ultimate technique', cost: 200, prereq: 'master_alchemist', bonus: {technique: 'immortal_elixir'}}
    }
  }
};
