import {
  BASELINE_DPS,
  BASELINE_EHP,
  W_O,
  W_D,
  computeEnemyEHP,
} from './powerConstants.js';

export const enemyEHP = computeEnemyEHP;

export function enemyPP(enemy = {}) {
  const dps = (enemy.attack || 0) * (enemy.attackRate || 1);
  const ehp = computeEnemyEHP(enemy);
  const E_OPP = BASELINE_DPS > 0 ? 100 * (dps / BASELINE_DPS - 1) : 0;
  const E_DPP = BASELINE_EHP > 0 ? 100 * (ehp / BASELINE_EHP - 1) : 0;
  const EPP = W_O * E_OPP + W_D * E_DPP;
  return { EPP, E_OPP, E_DPP, EHP: ehp, DPS: dps };
}
