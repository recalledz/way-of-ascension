export const STATUSES = {
  poison: {
    element: 'wood',
    duration: 6,          // in seconds
    tickRate: 1,          // damage per second
    maxStacks: 20,
    scaleStat: 'mind',    // bonus from Mind stat
  },
  burn: {
    element: 'fire',
    duration: 4,
    tickRate: 1,
    maxStacks: 1,         // refresh only
    scaleStat: 'mind',
  },
  chill: {
    element: 'water',
    duration: 8,
    effect: { attackSpeed: -0.2, cooldown: 0.2 },
    stacksToFreeze: 5,    // if reached → freeze
  },
  entomb: { // STATUS-REFORM
    element: 'earth',
    duration: 5,
    effect: { immobilize: true },
  },
  ionize: { // STATUS-REFORM
    element: 'metal',
    duration: 5,
    effect: { armor: -0.1 },
  },
  enfeeble: { // STATUS-REFORM
    element: null,
    duration: 6,
    effect: { attack: -0.1 },
  },
  stun: { // STATUS-REFORM
    element: null,
    duration: 2,
  },
  interrupt: { // STATUS-REFORM
    element: null,
    duration: 0.1,
    maxStacks: 1,
  },
  // Alchemy pill buffs
  pill_body_t1: {
    duration: 30,
    maxStacks: 1,
    exclusivityGroup: 'body',
    tier: 1,
    onApply: ({ target }) => {
      target.tempAtk = (target.tempAtk || 0) + 4;
      target.tempArmor = (target.tempArmor || 0) + 3;
    },
    onExpire: ({ target }) => {
      target.tempAtk = (target.tempAtk || 0) - 4;
      target.tempArmor = (target.tempArmor || 0) - 3;
    },
  },
  pill_body_t2: {
    duration: 30,
    maxStacks: 1,
    exclusivityGroup: 'body',
    tier: 2,
    onApply: ({ target }) => {
      target.tempAtk = (target.tempAtk || 0) + 8;
      target.tempArmor = (target.tempArmor || 0) + 6;
    },
    onExpire: ({ target }) => {
      target.tempAtk = (target.tempAtk || 0) - 8;
      target.tempArmor = (target.tempArmor || 0) - 6;
    },
  },
  pill_breakthrough_t1: {
    duration: 60,
    maxStacks: 1,
    exclusivityGroup: 'breakthrough',
    tier: 1,
    onApply: ({ target }) => {
      target.breakthroughBonus = (target.breakthroughBonus || 0) + 0.1;
    },
    onExpire: ({ target }) => {
      target.breakthroughBonus = (target.breakthroughBonus || 0) - 0.1;
    },
  },
  pill_breakthrough_t2: {
    duration: 60,
    maxStacks: 1,
    exclusivityGroup: 'breakthrough',
    tier: 2,
    onApply: ({ target }) => {
      target.breakthroughBonus = (target.breakthroughBonus || 0) + 0.15;
    },
    onExpire: ({ target }) => {
      target.breakthroughBonus = (target.breakthroughBonus || 0) - 0.15;
    },
  },
};

// Compatibility alias
export const STATUS_REGISTRY = STATUSES;
