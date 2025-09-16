import { drFromArmor, dEhpFromHP, dEhpFromRes, dEhpFromDodge } from '../lib/power/ehp.js';
import { DODGE_BASE } from '../features/combat/hit.js';
import { BASELINE_HP, BASELINE_DPS } from '../lib/power/baseline.js';
import { W_O, W_D } from './pp.js';

export function enemyEHP(enemy = {}) {
  const hp = enemy.hpMax ?? enemy.hp ?? 0;
  const armor = enemy.armor ?? 0;
  const dodge = (enemy.stats?.dodge ?? enemy.dodge ?? 0) + DODGE_BASE;
  const resists = enemy.resists || {};
  const dr = drFromArmor(armor);
  let ehpPct = dEhpFromHP(hp, dr);
  for (const val of Object.values(resists)) {
    ehpPct += dEhpFromRes(val);
  }
  ehpPct += dEhpFromDodge(dodge);
  const baseHp = BASELINE_HP || 1;
  return (1 + ehpPct) * baseHp;
}

export function enemyPP(enemy = {}) {
  const dps = (enemy.attack || 0) * (enemy.attackRate || 1);
  const baseDps = BASELINE_DPS || 1;
  const E_OPP = baseDps > 0 ? ((dps / baseDps) - 1) * 100 : 0;
  const ehp = enemyEHP(enemy);
  const baseHp = BASELINE_HP || 1;
  const E_DPP = baseHp > 0 ? ((ehp / baseHp) - 1) * 100 : 0;
  const EPP = W_O * E_OPP + W_D * E_DPP;
  return { EPP, E_OPP, E_DPP, EHP: ehp, DPS: dps };
}
