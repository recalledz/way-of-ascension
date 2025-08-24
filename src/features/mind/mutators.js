// src/features/mind/mutators.js

import { getManual } from './data/manuals.js';
import { getTalisman } from './data/talismans.js';
import {
  calcFromProficiency,
  calcFromManual,
  calcFromCraft,
  applyPuzzleMultiplier,
  levelForXp,
} from './logic.js';

export function awardFromProficiency(S, profXp) {
  const add = calcFromProficiency(profXp);
  S.mind.fromProficiency += add;
  S.mind.xp += applyPuzzleMultiplier(add, S.mind.multiplier);
  S.mind.level = levelForXp(S.mind.xp);
}

export function startReading(S, manualId) {
  const m = getManual(manualId);
  if (!m) return false;
  if (S.mind.level < m.reqLevel) return false;
  S.mind.activeManualId = manualId;
  if (!S.mind.manualProgress[manualId]) {
    S.mind.manualProgress[manualId] = { xp: 0, done: false };
  }
  return true;
}

export function stopReading(S) {
  S.mind.activeManualId = null;
}

export function craftTalisman(S, talismanId) {
  const t = getTalisman(talismanId);
  if (!t) return false;
  // assume resource checks done elsewhere for now
  const add = calcFromCraft(t);
  S.mind.fromCrafting += add;
  S.mind.xp += applyPuzzleMultiplier(add, S.mind.multiplier);
  S.mind.level = levelForXp(S.mind.xp);
  return true;
}

export function solvePuzzle(S, difficultyIndex) {
  // permanent multiplier: 1 + 0.05 per difficulty step
  const inc = 1 + Math.max(0, difficultyIndex) * 0.05;
  S.mind.multiplier *= inc;
  S.mind.solvedPuzzles += 1;
}

export function onTick(S, dt) {
  const id = S.mind.activeManualId;
  if (!id) return;
  const manual = getManual(id);
  if (!manual) return;
  const add = calcFromManual(manual, dt, S.stats);
  const applied = applyPuzzleMultiplier(add, S.mind.multiplier);
  S.mind.fromReading += add;
  S.mind.xp += applied;
  const rec = S.mind.manualProgress[id];
  rec.xp += add;
  if (rec.xp >= manual.reqLevel * 100) {
    rec.done = true;
  }
  S.mind.level = levelForXp(S.mind.xp);
}

