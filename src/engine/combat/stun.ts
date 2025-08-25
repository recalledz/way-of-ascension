export interface StunState {
  /** Current stun progress, 0-100 */
  value: number;
}

const STUN_THRESHOLD = 100;
const MAX_STUN_PER_HIT = 40; // per-hit cap in percent
const DECAY_PER_SECOND = 6; // stun bar decays this % each second
const BASE_STUN_DURATION_MS = 2000;

interface StunOptions {
  attackerStats?: {
    stunBuildMult?: number;
    stunDurationMult?: number;
  };
  targetStats?: {
    stunBuildTakenReduction?: number;
    stunResist?: number;
    ccResist?: number;
  };
  /** apply a status to the target (key, durationMs) */
  applyStatus?: (key: string, durationMs: number) => void;
  /** check if target currently has status */
  hasStatus?: (key: string) => boolean;
}

export function initStun(target: { stun?: StunState } | null): StunState {
  const stun: StunState = { value: 0 };
  if (target) (target as any).stun = stun;
  return stun;
}

/**
 * Call when a physical hit deals damage.
 * @param attacker Source of the hit
 * @param target Recipient of the hit
 * @param damage Final damage dealt
 * @param nowMs  Timestamp of the hit
 */
export function onPhysicalHit(
  attacker: any,
  target: any,
  damage: number,
  nowMs: number,
): void {
  const stun: StunState | undefined = target?.stun;
  const targetMaxHP = target?.hpMax ?? 0;
  if (!stun || targetMaxHP <= 0) return;
  const attackerStats = attacker?.stats || {};
  const targetStats = target?.stats || {};
  addStunPercent(stun, (damage / targetMaxHP) * 100, {
    attackerStats,
    targetStats,
    applyStatus: target?.applyStatus?.bind(target),
    hasStatus: target?.hasStatus?.bind(target),
  });
}

/** Reduce stun progress over elapsed time. */
export function tickStunDecay(target: any, dtSec: number, nowMs: number): void {
  const stun: StunState | undefined = target?.stun;
  if (!stun) return;
  const decay = DECAY_PER_SECOND * dtSec;
  stun.value = Math.max(0, stun.value - decay);
}

/** Add stun progress; triggers stun when threshold reached. */
export function addStunPercent(
  stun: StunState,
  rawPercent: number,
  opts: StunOptions = {},
): void {
  const gain = Math.min(rawPercent, MAX_STUN_PER_HIT);
  stun.value += gain;
  if (stun.value >= STUN_THRESHOLD) {
    const overshoot = stun.value - STUN_THRESHOLD;
    stun.value = overshoot; // carry over overshoot
    triggerStun(overshoot, opts);
  }
}

function triggerStun(overshoot: number, opts: StunOptions): void {
  const { attackerStats = {}, targetStats = {}, applyStatus, hasStatus } = opts;
  let duration = BASE_STUN_DURATION_MS;
  duration *= 1 + (attackerStats.stunDurationMult || 0);
  duration *= 1 - (targetStats.stunResist || 0);
  duration *= 1 - (targetStats.ccResist || 0);
  duration *= 1 + overshoot / 100; // overshoot bonus
  if (hasStatus?.('stunWeakened')) {
    duration *= 0.5;
    applyStatus?.('stunImmune', 15000);
  } else {
    applyStatus?.('stunWeakened', 5000);
  }
  applyStatus?.('stunned', duration);
}

