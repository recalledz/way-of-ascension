const BASIC_ROTATION = [
  { type: 'foundationGain', value: 0.02, text: '+2% Foundation Gain' },
  { type: 'cultivationSpeed', value: 0.02, text: '+2% Cultivation Speed' },
  { type: 'manualComprehension', value: 0.02, text: '+2% Manual Comprehension' },
  { type: 'breakthroughChance', value: 0.01, text: '+1% Breakthrough Chance' },
  { type: 'qiRegen', value: 0.02, text: '+2% Qi Regeneration' },
  { type: 'maxQi', value: 0.02, text: '+2% max qi' },
];

// Ordered list of basic node IDs in the tree
const BASIC_IDS = [
  1,2,3,4,5,13,22,23,24,25,26,29,30,31,33,34,35,36,37,38,39,41,42,44,45,46,47,48,49,
  61,62,63,64,65,66,67,68,69,70,71,72,73,74,77,78,79,80,81,83,84,85,86,87,88,89,
  92,93,94,95,96,97,98,99,103,104,105,106,107,108
];

const NOTABLE_EFFECTS = {
  50: [
    { type: 'manualComprehension', value: 0.12, text: '+12% Manual Comprehension' },
    { type: 'cultivationSpeed', value: 0.10, text: '+10% Cultivation Speed' },
  ],
  75: [
    { type: 'manualComprehension', value: 0.20, text: '+20% Manual Comprehension' },
    { type: 'castSpeed', value: 0.10, text: '+10% Cast Speed' },
    { type: 'spellDamage', value: 0.10, text: '+10% Spell Damage' },
  ],
  76: [
    { type: 'summonDamage', value: 0.18, text: '+18% Summon Damage' },
    { type: 'summonsTaunt', value: 1, text: 'Your summons taunt on their first hit (10s cd)' },
    { type: 'gatheringSpeed', value: 0.10, text: '+10% Gathering Speed' },
  ],
  82: [
    { type: 'armor', value: 0.22, text: '+22% Armor' },
    { type: 'cooldownReduction', value: 0.12, text: '-12% Cooldowns' },
    { type: 'stunImmuneWithQiShield', value: 1, text: 'Cannot be Stunned while Qi Shield > 0' },
  ],
  90: [
    { type: 'accuracy', value: 0.20, text: '+20% Accuracy' },
    { type: 'physicalPenetration', value: 0.10, text: '+10% Physical Penetration' },
    { type: 'auraQiReserve', value: -0.10, text: 'Auras reserve -10% Qi' },
  ],
  91: [
    { type: 'bonusPhysFromBreakChance', value: 1, text: 'Gain additional Physical Bonus Damage equal to (100% − your current Breakthrough Chance) on hit' },
  ],
  100: [
    { type: 'fireDamage', value: 0.18, text: '+18% Fire Damage' },
    { type: 'attackSpeedBuff', value: 0.30, text: 'After using an ability: +30% Attack Speed for 4s (8s cd)' },
  ],
  101: [
    { type: 'physicalDamage', value: 0.12, text: '+12% Physical Damage' },
    { type: 'stunOnIgnited', value: 0.25, text: 'Hits vs Ignited enemies: +25% Stun' },
    { type: 'fireResistance', value: 0.10, text: '+10% Fire Resistance' },
  ],
  109: [
    { type: 'critDamage', value: 0.18, text: '+18% Crit Damage' },
    { type: 'critChance', value: 0.04, text: '+4% Crit Chance' },
    { type: 'dodgeAfterCrit', value: 0.20, text: 'After a Critical Strike: +20% Dodge for 2s (8s cd)' },
  ],
  110: [
    { type: 'attackSpeed', value: 0.15, text: '+15% Attack Speed' },
    { type: 'castSpeed', value: 0.10, text: '+10% Cast Speed' },
  ],
};

export function getEffectsForNode(id){
  if(NOTABLE_EFFECTS[id]) return NOTABLE_EFFECTS[id];
  const idx = BASIC_IDS.indexOf(id);
  if(idx === -1) return null;
  const effect = { ...BASIC_ROTATION[idx % BASIC_ROTATION.length] };
  if(id === 96){
    effect.value = -0.02;
    effect.text = '-2% max qi';
  }
  return [effect];
}

const effectAppliers = {
  foundationGain: (s,v)=>{ s.cultivation.foundationMult += v; },
  cultivationSpeed: (s,v)=>{ s.astral.bonuses.cultivationSpeed = (s.astral.bonuses.cultivationSpeed||0)+v; },
  manualComprehension: (s,v)=>{ s.astral.bonuses.manualComprehension = (s.astral.bonuses.manualComprehension||0)+v; },
  breakthroughChance: (s,v)=>{ s.astral.bonuses.breakthroughChance = (s.astral.bonuses.breakthroughChance||0)+v; },
  qiRegen: (s,v)=>{ s.qiRegenMult += v; },
  maxQi: (s,v)=>{ s.qiCapMult += v; },
  castSpeed: (s,v)=>{ s.astral.bonuses.castSpeed = (s.astral.bonuses.castSpeed||0)+v; },
  spellDamage: (s,v)=>{ s.astral.bonuses.spellDamage = (s.astral.bonuses.spellDamage||0)+v; },
  summonDamage: (s,v)=>{ s.astral.bonuses.summonDamage = (s.astral.bonuses.summonDamage||0)+v; },
  summonsTaunt: (s)=>{ s.astral.bonuses.summonsTaunt = true; },
  gatheringSpeed: (s,v)=>{ s.astral.bonuses.gatheringSpeed = (s.astral.bonuses.gatheringSpeed||0)+v; },
  armor: (s,v)=>{ s.astral.bonuses.armor = (s.astral.bonuses.armor||0)+v; },
  cooldownReduction: (s,v)=>{ s.stats.cooldownReduction += v; },
  stunImmuneWithQiShield: (s)=>{ s.astral.bonuses.stunImmuneWithQiShield = true; },
  accuracy: (s,v)=>{ s.stats.accuracy += v; },
  physicalPenetration: (s,v)=>{ s.astral.bonuses.physicalPenetration = (s.astral.bonuses.physicalPenetration||0)+v; },
  auraQiReserve: (s,v)=>{ s.astral.bonuses.auraQiReserve = (s.astral.bonuses.auraQiReserve||0)+v; },
  bonusPhysFromBreakChance: (s)=>{ s.astral.bonuses.bonusPhysFromBreakChance = true; },
  fireDamage: (s,v)=>{ s.astral.bonuses.fireDamage = (s.astral.bonuses.fireDamage||0)+v; },
  attackSpeedBuff: (s,v)=>{ s.astral.bonuses.attackSpeedBuff = v; },
  physicalDamage: (s,v)=>{ s.astral.bonuses.physicalDamage = (s.astral.bonuses.physicalDamage||0)+v; },
  stunOnIgnited: (s,v)=>{ s.astral.bonuses.stunOnIgnited = v; },
  fireResistance: (s,v)=>{ s.astral.bonuses.fireResistance = (s.astral.bonuses.fireResistance||0)+v; },
  critDamage: (s,v)=>{ s.astral.bonuses.critDamage = (s.astral.bonuses.critDamage||0)+v; },
  critChance: (s,v)=>{ s.stats.criticalChance += v; },
  dodgeAfterCrit: (s,v)=>{ s.astral.bonuses.dodgeAfterCrit = v; },
  attackSpeed: (s,v)=>{ s.stats.attackSpeed += v; },
};

export function applyEffectsForNode(state, id){
  const effects = getEffectsForNode(id);
  if(!effects) return;
  for(const eff of effects){
    const fn = effectAppliers[eff.type];
    fn?.(state, eff.value);
  }
}

export function applyAllAllocated(state){
  if(!state.astral || !Array.isArray(state.astral.allocated)) return;
  Object.defineProperty(state.astral, 'bonuses', { value: {}, enumerable: false, writable: true });
  for(const id of state.astral.allocated){
    applyEffectsForNode(state, id);
  }
}
