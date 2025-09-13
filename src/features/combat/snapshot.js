export function buildAttackSnapshot(state = {}) {
  const profile = {
    phys: state.adventure?.playerAtkProfile?.phys || 0,
    elems: { ...(state.adventure?.playerAtkProfile?.elems || {}) },
  };

  const catPct = {};
  const bonuses = state.astralTreeBonuses || {};
  for (const key in bonuses) {
    if (key.endsWith('DamagePct')) {
      const elem = key.replace('DamagePct', '');
      catPct[elem === 'physical' ? 'physical' : elem] = (bonuses[key] || 0) / 100;
    }
  }

  const critChance = state.attributes?.criticalChance || 0;
  const critMult = state.attributes?.critMult || 2;
  const globalPct = 0;

  return { profile, catPct, critChance, critMult, globalPct };
}
