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
  // TODO: entomb, ionize, enfeeble, etc.
};

// Compatibility alias
export const STATUS_REGISTRY = STATUSES;
