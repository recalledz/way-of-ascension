export const migrations = [
  save => {
    if (typeof save.forging === 'undefined') {
      save.forging = { level: 1, exp: 0, expMax: 100, current: null, slot: null };
    } else {
      if (typeof save.forging.level === 'undefined') save.forging.level = 1;
      if (typeof save.forging.exp === 'undefined') save.forging.exp = 0;
      if (typeof save.forging.expMax === 'undefined') save.forging.expMax = 100;
      if (typeof save.forging.current === 'undefined') save.forging.current = null;
      if (typeof save.forging.slot === 'undefined') save.forging.slot = null;
    }
    if (save.activities && typeof save.activities.forging === 'undefined') {
      save.activities.forging = false;
    }
  }
];
