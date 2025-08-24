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

// Apply manual reward effects to the player once a manual level is
// completed.  Supports percentage-based fields (e.g. `armorPct`) which
// scale existing stats, and flat fields that directly add to the stat.
export function applyManualEffects(player, manual, level) {
  const effects = manual?.effects?.[level - 1];
  if (!effects) return;

  player.stats = player.stats || {};
  for (const [key, val] of Object.entries(effects)) {
    if (key.endsWith('Pct')) {
      const stat = key.slice(0, -3);
      if (stat in player.stats) {
        player.stats[stat] = (player.stats[stat] || 0) * (1 + val / 100);
      } else if (stat in player) {
        player[stat] = (player[stat] || 0) * (1 + val / 100);
      }
    } else if (key in player.stats) {
      player.stats[key] = (player.stats[key] || 0) + val;
    } else {
      player[key] = (player[key] || 0) + val;
    }
  }
}

