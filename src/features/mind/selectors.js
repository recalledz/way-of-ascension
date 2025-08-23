export function getMind(state = {}) {
  return state.mind || {};
}

export function mindBreakdown(S) {
  const m = S.mind;
  const base = m.fromProficiency + m.fromReading + m.fromCrafting;
  return {
    base,
    multiplier: m.multiplier,
    total: base * m.multiplier,
    sources: {
      proficiency: m.fromProficiency,
      reading: m.fromReading,
      crafting: m.fromCrafting,
    },
  };
}

export function currentMindLevel(S) {
  return S.mind.level;
}

export function currentMindXp(S) {
  return S.mind.xp;
}
