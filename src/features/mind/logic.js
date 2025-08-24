// src/features/mind/logic.js

// Pure calculation helpers for the Mind feature. These functions do not
// mutate state and are easily unit testable.

export function calcFromProficiency(profXp) {
  return Math.max(0, profXp) * 0.25;
}

export function calcManualSpeed(manual, stats) {
  const weights = manual?.statWeights;
  if (!weights || !stats) return 1;
  let boost = 0;
  for (const [stat, weight] of Object.entries(weights)) {
    const val = (stats[stat] ?? 0) - 10;
    if (val > 0) boost += val * weight;
  }
  const mult = 1 + boost / 10;
  const cap = 1 + (manual?.maxSpeedBoostPct || 0) / 100;
  return Math.min(mult, cap);
}

export function calcFromManual(manual, dt, stats) {
  if (!manual) return 0;
  const speed = calcManualSpeed(manual, stats);
  return manual.xpRate * dt * speed;
}

export function calcFromCraft(talisman) {
  return (talisman?.tier || 0) * (talisman?.xpMult || 1) * 5;
}

export function applyPuzzleMultiplier(base, mult) {
  return base * (mult || 1);
}

export function levelForXp(xp) {
  // simple curve placeholder
  let lvl = 1;
  let need = 50;
  while (xp >= need) {
    xp -= need;
    lvl += 1;
    need = Math.ceil(need * 1.35);
  }
  return lvl;
}

export function xpProgress(xp) {
  let need = 50;
  while (xp >= need) {
    xp -= need;
    need = Math.ceil(need * 1.35);
  }
  return { current: xp, next: need };
}

