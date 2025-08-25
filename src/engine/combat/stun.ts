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

export function initStun(): StunState {
  return { value: 0 };
}

/**
 * Call when a physical hit deals damage.
 * @param damage Amount of damage dealt
 * @param targetMaxHP Target's maximum HP for scaling
 */
export function onPhysicalHit(
  stun: StunState,
  damage: number,
  targetMaxHP: number,
  opts: StunOptions = {}
): void {
  if (targetMaxHP <= 0) return;
  if (opts.hasStatus?.('stunImmune')) return;
  let percent = (damage / targetMaxHP) * 100;
  const { attackerStats = {}, targetStats = {} } = opts;
  if (attackerStats.stunBuildMult) {
    percent *= 1 + attackerStats.stunBuildMult;
  }
  if (targetStats.stunBuildTakenReduction) {
    percent *= 1 - targetStats.stunBuildTakenReduction;
  }
  addStunPercent(stun, percent, opts);
}

/** Reduce stun progress over elapsed time. */
export function tickStunDecay(stun: StunState, deltaMs: number): void {
  const decay = (DECAY_PER_SECOND * deltaMs) / 1000;
  stun.value = Math.max(0, stun.value - decay);
}

/** Add stun progress; triggers stun when threshold reached. */
export function addStunPercent(
  stun: StunState,
  rawPercent: number,
  opts: StunOptions = {}
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
