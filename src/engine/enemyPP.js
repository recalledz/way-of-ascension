import { effectiveHP } from '../lib/power/ehp.js';
import { DODGE_BASE } from '../features/combat/hit.js';
import { W_O, W_D } from './pp.js';
import { BASELINE_DPS, BASELINE_EHP } from './baseline.js';

export function enemyEHP(enemy = {}) {
  const hp = enemy.hpMax ?? enemy.hp ?? 0;
  const armor = enemy.armor ?? 0;
  const dodge = (enemy.stats?.dodge ?? enemy.dodge ?? 0) + DODGE_BASE;
  const resists = enemy.resists || {};
  const qiRegenPct = enemy.qiRegenPct || 0;
  const maxQiPct = enemy.maxQiPct || 0;
  return effectiveHP({ hp, armor, dodge, resists, qiRegenPct, maxQiPct });
}

export function enemyPP(enemy = {}, overrides = {}) {
  const dps = (enemy.attack || 0) * (enemy.attackRate || 1);
  const ehp = enemyEHP(enemy);
  const baselineDps = Number.isFinite(overrides?.baselineDps) && overrides.baselineDps > 0
    ? overrides.baselineDps
    : BASELINE_DPS;
  const baselineEhp = Number.isFinite(overrides?.baselineEhp) && overrides.baselineEhp > 0
    ? overrides.baselineEhp
    : BASELINE_EHP;
  const E_OPP = baselineDps > 0 ? 100 * (dps / baselineDps - 1) : 0;
  const E_DPP = baselineEhp > 0 ? 100 * (ehp / baselineEhp - 1) : 0;
  const safeEOPP = Number.isFinite(E_OPP) ? E_OPP : 0;
  const safeEDPP = Number.isFinite(E_DPP) ? E_DPP : 0;
  const EPP = W_O * safeEOPP + W_D * safeEDPP;
  return {
    EPP,
    E_OPP: safeEOPP,
    E_DPP: safeEDPP,
    EHP: ehp,
    raw: { dps, ehp },
  };
}
