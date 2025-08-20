export function initHp(hpMax){
  const max = Math.round(hpMax);
  return { hp: max, hpMax: max };
}
