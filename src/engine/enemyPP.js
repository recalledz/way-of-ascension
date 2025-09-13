import { drFromArmor, dEhpFromHP, dEhpFromRes, dEhpFromDodge } from '../lib/power/ehp.js';
import { DODGE_BASE } from '../features/combat/hit.js';
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
  return (1 + ehpPct) * 100;
}

export function enemyPP(enemy = {}) {
  const dps = (enemy.attack || 0) * (enemy.attackRate || 1);
  const E_OPP = dps;
  const ehp = enemyEHP(enemy);
  const E_DPP = ((ehp / 100) - 1) * 100 * W_D;
  const EPP = W_O * E_OPP + E_DPP;
  return { EPP, E_OPP, E_DPP, EHP: ehp };
}
