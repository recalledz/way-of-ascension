export interface WeaponBase {
  min: number;
  max: number;
  attackRate: number;
}

export interface WeaponScales {
  physique: number;
  agility: number;
  mind: number;
}

export interface WeaponAnimations {
  fx: string[];
  tint: 'auto';
}

export interface WeaponReqs {
  realmMin?: number;
  proficiencyMin?: number;
}

export interface WeaponStatusHooks {
  onHit?: string;
  onCrit?: string;
}

export interface WeaponData {
  key: string;
  displayName: string;
  slot: 'mainhand';
  base: WeaponBase;
  scales: WeaponScales;
  tags: string[];
  statusHooks: WeaponStatusHooks;
  reqs: WeaponReqs;
  proficiencyKey: string;
  animations: WeaponAnimations;
}

export const WEAPONS: Record<string, WeaponData> = {
  fist: {
    key: 'fist',
    displayName: 'Fist',
    slot: 'mainhand',
    base: { min: 1, max: 2, attackRate: 1.2 },
    scales: { physique: 0.6, agility: 0.3, mind: 0.1 },
    tags: ['melee'],
    statusHooks: {},
    reqs: {},
    proficiencyKey: 'unarmed',
    animations: { fx: ['punch'], tint: 'auto' },
  },
  palm: {
    key: 'palm',
    displayName: 'Palm',
    slot: 'mainhand',
    base: { min: 1, max: 3, attackRate: 1.3 },
    scales: { physique: 0.5, agility: 0.4, mind: 0.1 },
    tags: ['melee'],
    statusHooks: { onHit: 'stun' },
    reqs: {},
    proficiencyKey: 'unarmed',
    animations: { fx: ['thrustLine'], tint: 'auto' },
  },
  sword: {
    key: 'sword',
    displayName: 'Sword',
    slot: 'mainhand',
    base: { min: 2, max: 4, attackRate: 1.1 },
    scales: { physique: 0.5, agility: 0.5, mind: 0 },
    tags: ['melee'],
    statusHooks: { onCrit: 'bleed' },
    reqs: { proficiencyMin: 1 },
    proficiencyKey: 'sword',
    animations: { fx: ['slashArc'], tint: 'auto' },
  },
  spear: {
    key: 'spear',
    displayName: 'Spear',
    slot: 'mainhand',
    base: { min: 3, max: 5, attackRate: 0.9 },
    scales: { physique: 0.6, agility: 0.4, mind: 0 },
    tags: ['melee'],
    statusHooks: { onHit: 'bleed' },
    reqs: { proficiencyMin: 1 },
    proficiencyKey: 'spear',
    animations: { fx: ['thrustLine'], tint: 'auto' },
  },
  nunchaku: {
    key: 'nunchaku',
    displayName: 'Nunchaku',
    slot: 'mainhand',
    base: { min: 1, max: 3, attackRate: 1.5 },
    scales: { physique: 0.4, agility: 0.6, mind: 0 },
    tags: ['melee'],
    statusHooks: { onCrit: 'stun' },
    reqs: { proficiencyMin: 2 },
    proficiencyKey: 'nunchaku',
    animations: { fx: ['slashArc'], tint: 'auto' },
  },
  chakram: {
    key: 'chakram',
    displayName: 'Chakram',
    slot: 'mainhand',
    base: { min: 2, max: 3, attackRate: 1.3 },
    scales: { physique: 0.3, agility: 0.7, mind: 0 },
    tags: ['ranged'],
    statusHooks: { onHit: 'bleed' },
    reqs: { proficiencyMin: 2 },
    proficiencyKey: 'chakram',
    animations: { fx: ['ringShockwave'], tint: 'auto' },
  },
  wand: {
    key: 'wand',
    displayName: 'Wand',
    slot: 'mainhand',
    base: { min: 1, max: 2, attackRate: 1.2 },
    scales: { physique: 0, agility: 0, mind: 1 },
    tags: ['caster'],
    statusHooks: { onHit: 'burn' },
    reqs: { realmMin: 1 },
    proficiencyKey: 'wand',
    animations: { fx: ['magicBolt'], tint: 'auto' },
  },
  focus: {
    key: 'focus',
    displayName: 'Focus',
    slot: 'mainhand',
    base: { min: 1, max: 1, attackRate: 1.0 },
    scales: { physique: 0, agility: 0.2, mind: 0.8 },
    tags: ['caster'],
    statusHooks: { onHit: 'spark' },
    reqs: { realmMin: 1 },
    proficiencyKey: 'focus',
    animations: { fx: ['ringShockwave'], tint: 'auto' },
  },
  hammer: {
    key: 'hammer',
    displayName: 'Hammer',
    slot: 'mainhand',
    base: { min: 5, max: 8, attackRate: 0.8 },
    scales: { physique: 0.8, agility: 0.2, mind: 0 },
    tags: ['melee'],
    statusHooks: { onHit: 'stun' },
    reqs: { proficiencyMin: 3 },
    proficiencyKey: 'hammer',
    animations: { fx: ['ringShockwave'], tint: 'auto' },
  },
  scepter: {
    key: 'scepter',
    displayName: 'Scepter',
    slot: 'mainhand',
    base: { min: 2, max: 4, attackRate: 1.0 },
    scales: { physique: 0.2, agility: 0.2, mind: 0.6 },
    tags: ['caster'],
    statusHooks: { onHit: 'weaken' },
    reqs: { realmMin: 2 },
    proficiencyKey: 'scepter',
    animations: { fx: ['magicBolt'], tint: 'auto' },
  },
};
