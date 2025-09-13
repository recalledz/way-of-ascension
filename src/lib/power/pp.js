export const DamageElements = ["phys", "fire", "cold", "lightning", "poison", "arcane"];

export function Snapshot(opts = {}) {
  const {
    weapon = {},
    nonWeaponFlat = {},
    critChance = 0,
    critMult = 1,
    globalPct = 0,
    armor = 0,
    aps = 1,
    hp = 0,
    op = 0,
    dp = 0,
  } = opts;
  return { weapon, nonWeaponFlat, critChance, critMult, globalPct, armor, aps, hp, op, dp };
}

export function armorDR(damage, armor) {
  return Math.max(damage - armor, 0);
}

export function idleDPS(snap) {
  const crit = 1 + snap.critChance * (snap.critMult - 1);
  let total = 0;
  for (const el of DamageElements) {
    const base = snap.weapon[el] || 0;
    const afterCrit = base * crit * (1 + snap.op);
    const afterDefense = armorDR(afterCrit, snap.armor);
    total += afterDefense;
  }
  return total * (1 + snap.globalPct) * snap.aps;
}

export function ehp(snap) {
  return (snap.hp + snap.armor) * (1 + snap.dp);
}

export const dpsDelta = (base, mod) => (mod - base) / base;
export const ehpDelta = (base, mod) => (mod - base) / base;

export function ppFromDeltas({ dps, ehp }) {
  return (1 + dps) * (1 + ehp) - 1;
}
