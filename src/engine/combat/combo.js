import { S } from '../../shared/state.js';

export const COMBO_WINDOW_MS = 600;

const targetIds = new WeakMap();
let nextComboId = 1;

function ensureCombo(state = S) {
  if (!state) return { count: 0, expiresAt: 0, targetKey: null };
  state.combo ||= { count: 0, expiresAt: 0, targetKey: null };
  const combo = state.combo;
  if (typeof combo.count !== 'number' || !Number.isFinite(combo.count)) combo.count = 0;
  if (typeof combo.expiresAt !== 'number' || !Number.isFinite(combo.expiresAt)) combo.expiresAt = 0;
  if (combo.targetKey === undefined) combo.targetKey = null;
  return combo;
}

function identifyTarget(target) {
  if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
    return target ?? null;
  }
  let id = targetIds.get(target);
  if (!id) {
    id = `combo:${nextComboId++}`;
    targetIds.set(target, id);
  }
  return id;
}

function clearCombo(state = S) {
  const combo = ensureCombo(state);
  combo.count = 0;
  combo.expiresAt = 0;
  combo.targetKey = null;
  return combo;
}

export function resetCombo(state = S) {
  return clearCombo(state);
}

export function getComboCount(state = S, nowMs = Date.now()) {
  const combo = ensureCombo(state);
  if (combo.count > 0 && combo.expiresAt && nowMs >= combo.expiresAt) {
    clearCombo(state);
    return 0;
  }
  return combo.count || 0;
}

export function getComboDamageBonus(state = S, nowMs = Date.now()) {
  const count = getComboCount(state, nowMs);
  if (!count) return 0;
  const extraSources = [
    state?.gearStats?.comboDamagePct,
    state?.derivedStats?.comboDamagePct,
    state?.stats?.comboDamagePct,
    state?.comboDamagePct,
  ];
  const extra = extraSources.reduce((sum, value) => sum + (Number(value) || 0), 0);
  const perStack = Math.max(0, 0.1 + extra);
  return perStack * count;
}

export function recordComboHit(target, nowMs = Date.now(), state = S) {
  const key = identifyTarget(target);
  if (!key) {
    clearCombo(state);
    return 0;
  }
  const combo = ensureCombo(state);
  const expired = combo.count > 0 && combo.expiresAt && nowMs >= combo.expiresAt;
  if (expired || (combo.targetKey && combo.targetKey !== key)) {
    clearCombo(state);
  }
  const next = ensureCombo(state);
  next.count = (next.count || 0) + 1;
  next.targetKey = key;
  next.expiresAt = nowMs + COMBO_WINDOW_MS;
  return next.count;
}

export function registerComboMiss(state = S) {
  clearCombo(state);
}

export function getComboWindowEnd(state = S) {
  const combo = ensureCombo(state);
  return combo.expiresAt || 0;
}
