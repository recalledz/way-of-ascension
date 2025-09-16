import { ENEMY_DATA } from '../features/adventure/data/enemies.js';
import { DODGE_BASE } from '../features/combat/hit.js';
import { effectiveHP } from '../lib/power/ehp.js';

export const BASELINE_ENEMY_KEY = 'Forest Rabbit';

const BASELINE_DATA = ENEMY_DATA[BASELINE_ENEMY_KEY] || {};

const baselineHp = BASELINE_DATA.hpMax ?? BASELINE_DATA.hp ?? 1;
const baselineAttack = BASELINE_DATA.attack ?? 0;
const baselineRate = BASELINE_DATA.attackRate ?? 1;
const computedDps = baselineAttack * baselineRate;

export const BASELINE_HP = baselineHp || 1;
export const BASELINE_DPS = computedDps > 0 ? computedDps : 1;

const baselineEhp = effectiveHP({
  hp: baselineHp,
  armor: BASELINE_DATA.armor ?? 0,
  dodge: (BASELINE_DATA.stats?.dodge ?? BASELINE_DATA.dodge ?? 0) + DODGE_BASE,
  resists: BASELINE_DATA.resists || {},
  qiRegenPct: BASELINE_DATA.qiRegenPct || 0,
  maxQiPct: BASELINE_DATA.maxQiPct || 0,
});

export const BASELINE_EHP = Number.isFinite(baselineEhp) && baselineEhp > 0 ? baselineEhp : BASELINE_HP;

export const BASELINE_ENEMY = {
  ...BASELINE_DATA,
  hp: baselineHp,
  attack: baselineAttack,
  attackRate: baselineRate,
};
