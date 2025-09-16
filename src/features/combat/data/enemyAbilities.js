export const ENEMY_ABILITIES = {
  heavyStrike: {
    key: 'heavyStrike',
    name: 'Heavy Strike',
    description: 'Delivers a crushing blow for greatly increased physical damage.',
    actionType: 'attack',
    cooldownMs: 9000,
    initialDelayMs: 2000,
    priority: 1,
    attack: {
      physPct: 1.6,
      critChanceBonus: 0.1,
    },
    log: 'The enemy winds up for a heavy strike!',
  },
  venomSpit: {
    key: 'venomSpit',
    name: 'Venom Spit',
    description: 'Spits venom that damages and attempts to poison the player.',
    actionType: 'attack',
    cooldownMs: 12000,
    priority: 1,
    attack: {
      physPct: 0.6,
    },
    status: { key: 'poison', power: 0.7 },
    log: 'The enemy spits a glob of venom!',
  },
  shadowEnrage: {
    key: 'shadowEnrage',
    name: 'Shadow Enrage',
    description: 'When wounded, the enemy becomes enraged, increasing attack and speed.',
    actionType: 'buff',
    cooldownMs: 0,
    healthBelowPct: 0.5,
    once: true,
    priority: 10,
    buff: {
      attackMult: 1.25,
      attackRateMult: 1.15,
    },
    log: 'Shadows coil around the enemy as it becomes enraged!',
  },
  shadowBolt: {
    key: 'shadowBolt',
    name: 'Shadow Bolt',
    description: 'Unleashes crackling metal-aspected energy that inflicts elemental damage and weakens armor.',
    actionType: 'attack',
    cooldownMs: 10000,
    priority: 2,
    attack: {
      physPct: 0.4,
      elemPct: { metal: 0.85 },
      critChanceBonus: 0.05,
    },
    status: { key: 'ionize', power: 0.6 },
    log: 'The enemy channels a bolt of shadowed lightning!',
  },
  darkRecovery: {
    key: 'darkRecovery',
    name: 'Dark Recovery',
    description: 'Draws on dark energy to recover health and purge lingering ailments.',
    actionType: 'heal',
    cooldownMs: 20000,
    healthBelowPct: 0.3,
    priority: 8,
    heal: {
      hpPct: 0.15,
      clearAilments: ['poison', 'burn'],
    },
    log: 'The enemy siphons shadows to mend its wounds!',
  },
};

export function getEnemyAbility(key) {
  return ENEMY_ABILITIES[key];
}
