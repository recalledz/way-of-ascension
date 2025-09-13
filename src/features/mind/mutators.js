// src/features/mind/mutators.js

import { getManual } from './data/manuals.js';
import { getTalismanRecipe } from './data/talismans.js';
import { getTalisman as getTalismanItem } from '../talismans/data/talismans.js';
import { addToInventory } from '../inventory/mutators.js';
import { computePP, gatherDefense } from '../../engine/pp.js';
import { logPPEvent } from '../../engine/ppLog.js';
import {
  calcFromProficiency,
  calcFromManual,
  calcFromCraft,
  applyPuzzleMultiplier,
  levelForXp,
  applyManualEffects,
} from './logic.js';
import { on } from '../../shared/events.js';

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
  const rec = S.mind.manualProgress[manualId] || { xp: 0, level: 0 };
  if (rec.level >= m.maxLevel) return false;
  S.mind.manualProgress[manualId] = rec;
  S.mind.activeManualId = manualId;
  return true;
}

export function stopReading(S) {
  S.mind.activeManualId = null;
}

export function debugLevelManual(S) {
  const id = S.mind.activeManualId;
  if (!id) return false;
  const manual = getManual(id);
  if (!manual) return false;
  const rec = S.mind.manualProgress[id] || { xp: 0, level: 0 };
  if (rec.level >= manual.maxLevel) return false;
  const before = computePP(S, gatherDefense(S));
  rec.level += 1;
  rec.xp = 0;
  applyManualEffects(S, manual, rec.level);
  logPPEvent(S, 'manual-level', { manualId: id, level: rec.level, before });
  if (rec.level >= manual.maxLevel) {
    stopReading(S);
  }
  S.mind.manualProgress[id] = rec;
  return true;
}

export function craftTalisman(S, talismanId) {
  const recipe = getTalismanRecipe(talismanId);
  if (!recipe) return false;
  // assume resource checks done elsewhere for now
  const add = calcFromCraft(recipe);
  S.mind.fromCrafting += add;
  S.mind.xp += applyPuzzleMultiplier(add, S.mind.multiplier);
  S.mind.level = levelForXp(S.mind.xp);
  const item = getTalismanItem(talismanId);
  if (item) addToInventory(item, S);
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
  const rec = S.mind.manualProgress[id] || { xp: 0, level: 0 };
  if (rec.level >= manual.maxLevel) {
    stopReading(S);
    return;
  }
  const add = calcFromManual(manual, dt, S.attributes);
  const applied = applyPuzzleMultiplier(add, S.mind.multiplier);
  S.mind.fromReading += add;
  S.mind.xp += applied;
  rec.xp += add;

  const needed = manual.baseTimeSec * manual.levelTimeMult[rec.level] * manual.xpRate;
  if (rec.xp >= needed) {
    rec.xp -= needed;
    const before = computePP(S, gatherDefense(S));
    rec.level += 1;
    applyManualEffects(S, manual, rec.level);
    logPPEvent(S, 'manual-level', { manualId: id, level: rec.level, before });
    if (rec.level >= manual.maxLevel) {
      stopReading(S);
    }
  }
  S.mind.manualProgress[id] = rec;
  S.mind.level = levelForXp(S.mind.xp);
}

on('mind/manuals/startReading', ({ root, manualId }) => {
  startReading(root, manualId);
});

on('mind/manuals/debugLevelUp', ({ root }) => {
  debugLevelManual(root);
});

