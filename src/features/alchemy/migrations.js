export const migrations = [
  save => {
    if (save.alchemy && !Object.prototype.hasOwnProperty.call(save.alchemy, 'unlocked')) {
      save.alchemy.unlocked = true;
      save.alchemy.knownRecipes = { qi: true, body: true, ward: true };
    } else if (save.alchemy) {
      save.alchemy.knownRecipes = { qi: true, body: true, ward: true, ...(save.alchemy.knownRecipes || {}) };
    }
  },
  save => {
    if (save.alchemy) {
      if (!save.alchemy.lab) {
        save.alchemy.lab = { slots: 2, activeJobs: [], queue: [], paused: false };
      } else {
        save.alchemy.lab.activeJobs = save.alchemy.lab.activeJobs || [];
        save.alchemy.lab.queue = save.alchemy.lab.queue || [];
        if (typeof save.alchemy.lab.paused !== 'boolean') save.alchemy.lab.paused = false;
      }
      delete save.alchemy.labTimer;
    }
  }
];
