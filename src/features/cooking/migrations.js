export const migrations = [
  save => {
    if (typeof save.cooking === 'undefined') {
      save.cooking = { level: 1, exp: 0, expMax: 100, successBonus: 0 };
    } else if (typeof save.cooking.successBonus === 'undefined') {
      save.cooking.successBonus = 0;
    }
    if (save.activities && typeof save.activities.cooking === 'undefined') {
      save.activities.cooking = false;
    }
  }
];
