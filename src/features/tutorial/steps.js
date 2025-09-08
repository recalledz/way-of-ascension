import { fCap, realmStage } from '../progression/selectors.js';
import { showWeaponSelectOverlay } from '../../ui/weaponSelectOverlay.js';

const NOTABLE_NODE_IDS = [
  28, 33, 38, 52, 1028, 1033, 1038, 1043, 1052, 2028, 2033, 2038, 2043,
  2052, 3028, 3033, 3038, 3043, 3052, 4028, 4033, 4038, 4043, 4052, 4060,
  4061, 4062,
];

export const STEPS = [
  {
    title: 'Journey to immortality',
    text: 'Begin your practice by pressing the start cultivating button. While cultivating, you will gain foundation, which will accumulate until reaching max. Once you reach max you will be able to attempt breakthrough.',
    req: 'Objective: Reach 100% foundation on stage 1.',
    reward: 'Reward: 1 breakthrough pill and 1 Meridian-Opening Dan.',
    highlight: 'startCultivationActivity',
    check: state => state.foundation >= fCap(state) * 0.99,
    applyReward(state) {
      state.pills = state.pills || { qi: 0, body: 0, ward: 0, meridian_opening_dan: 0 };
      state.pills.ward = (state.pills.ward || 0) + 1;
      state.pills.meridian_opening_dan = (state.pills.meridian_opening_dan || 0) + 1;

      state.alchemy = state.alchemy || {};
      state.alchemy.outputs = state.alchemy.outputs || {};
      const out = state.alchemy.outputs.meridian_opening_dan || { qty: 0, tiers: {}, type: 'pill' };
      out.qty += 1;
      out.tiers[1] = (out.tiers[1] || 0) + 1;
      state.alchemy.outputs.meridian_opening_dan = out;
    },
  },
  {
    title: 'Breakthrough to stage 2',
    text: 'When enough foundation in practice has been gained, you can attempt to ascend to higher states of being. This is called a breakthrough, and only the boldest of spirit may attempt to pursue. Every breakthrough has a chance to be succesfull. However, there are ways to increase this that will become available as you progress. Each breakthrough is more difficult than the previous one. A breakthrough pill will help in increasing odds',
    req: 'Objective: Attempt breakthrough. Breakthrough chances can be viewed in the "stats" sub tab in cultivation.',
    reward: 'Reward: Unlock astral tree. 50 insight.',
    highlight: 'breakthroughBtnActivity',
    check: state => realmStage(state) >= 2,
    applyReward(state) {
      state.astralPoints = (state.astralPoints || 0) + 50;
      const btn = document.getElementById('openAstralTree');
      if (btn) btn.style.display = 'block';
    },
  },
  {
    title: 'Astral Insight',
    text: 'You have unlocked the astral tree which can be found on the top right of the cultivation menu. Buying astral nodes requieres Insight. Insight is gained by performing cultivation.  Doing other tasks will also increase your insight, at a lower rate. Insight is a precious resource, and each purchase increases the cost of all other nodes in the tree, so use it wisely',
    req: 'Objective: purchase your first notable (one of the bigger circles in the astral tree)',
    reward: 'Reward: unlock adventure, select weapon: (dim focus, crude knuckles or crude nunchaku)',
    highlight: 'openAstralTree',
    check: state => {
      const nodes = state.astralUnlockedNodes;
      if (!nodes) return false;
      for (const id of nodes) {
        if (NOTABLE_NODE_IDS.includes(Number(id))) return true;
      }
      return false;
    },
    applyReward(state) {
      state.tutorial = state.tutorial || {};
      state.tutorial.adventureUnlocked = true;
      showWeaponSelectOverlay(state);
    },
  },
  {
    title: 'Choose your path',
    text: 'There are 3 primary paths: Disciples of metal and fire use primal strength to brandish enemies and brute force through immortality by sheer resilience. Focus on fist, palms and hammers. Disciples of wood and earth use the knowledge and connection with the spirits to expand into greater horizons of existence. Focus on focus, wands and scepters. Disciples of water, freeflowing and nimble like water, harness the power to adapt any form. Use of spears, nunchaku and chakram. You may equip your weapon in the character menu. Access the menu and equip weapon to aid you in adventure progress',
    req: 'Objective: equip weapon in character menu and defeat 1 enemy in forest grove',
    reward: 'Reward: 10 cooked meat',
    highlight: 'characterSelector',
    check: state => {
      const weaponEquipped = state.equipment?.mainhand?.key && state.equipment.mainhand.key !== 'fist';
      const kills = state.adventure?.totalKills >= 1;
      return weaponEquipped && kills;
    },
    applyReward(state) {
      state.cookedMeat = (state.cookedMeat || 0) + 10;
    },
  },
  {
    title: 'Abilities',
    text: 'Each base type weapon comes with an ability. Abilities usually cost qi to use and have a set cooldown before it can be used again. More abilities may be learned or equipped through laws or manuals. Abilities may be equipped in character menu abilities sub tab.',
    req: 'Objective: Use an ability.',
    reward: 'Reward: None.',
    highlight: 'abilityBar',
    check: state => state.tutorial?.usedAbility,
  },
];
