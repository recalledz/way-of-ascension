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
    effect: { defense: -0.1 },
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
  },
};

// Compatibility alias
export const STATUS_REGISTRY = STATUSES;
