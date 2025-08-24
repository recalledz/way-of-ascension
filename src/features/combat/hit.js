export const HIT_FLOOR = 0.05;
export const HIT_CEIL = 0.95;
export const DODGE_SCALE = 0.64;
export const HIT_ALPHA = 1.0;
export const ACCURACY_BASE = 50;
export const DODGE_BASE = 5;

export function chanceToHit(accuracy = ACCURACY_BASE, dodge = DODGE_BASE) {
  const a = Math.max(0, accuracy);
  const d = Math.max(0, dodge) * DODGE_SCALE;
  const raw = (a <= 0 && d <= 0) ? 0.5 : (a / (a + d));
  const shaped = Math.pow(raw, HIT_ALPHA);
  return HIT_FLOOR + (HIT_CEIL - HIT_FLOOR) * shaped;
}
