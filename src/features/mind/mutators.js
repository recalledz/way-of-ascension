// src/features/mind/mutators.js

import { getManual } from './data/manuals.js';
import { getTalisman } from './data/talismans.js';
import { on } from '../../shared/events.js';
import { S } from '../../shared/state.js';
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
  const rec = S.mind.manualProgress[manualId] || { xp: 0, level: 0, done: false };
  if (rec.level >= m.maxLevel) return false;
  S.mind.activeManualId = manualId;
  S.mind.manualProgress[manualId] = rec;
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
  const rec = S.mind.manualProgress[id];
  if (!rec) return;
  if (rec.level >= manual.maxLevel) {
    S.mind.activeManualId = null;
    return;
  }
  // Manual progress by time
  rec.xp += dt;
  const need = manual.baseTimeSec * (manual.levelTimeMult[rec.level] || 0);
  if (need && rec.xp >= need) {
    rec.xp -= need;
    rec.level += 1;
    if (rec.level >= manual.maxLevel) {
      rec.level = manual.maxLevel;
      rec.done = true;
      S.mind.activeManualId = null;
    }
  }
  // Mind XP from reading
  const add = calcFromManual(manual, dt);
  const applied = applyPuzzleMultiplier(add, S.mind.multiplier);
  S.mind.fromReading += add;
  S.mind.xp += applied;
  S.mind.level = levelForXp(S.mind.xp);
}

on('mind/manuals/startReading', ({ id, root = S }) => {
  startReading(root, id);
});

