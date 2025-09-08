export const migrations = [
  save => {
    if (save.alchemy && !Object.prototype.hasOwnProperty.call(save.alchemy, 'unlocked')) {
      save.alchemy.unlocked = true;
      save.alchemy.knownRecipes = {};
    }
  },
  save => {
    if (save.alchemy) {
      if (!save.alchemy.lab) {
        save.alchemy.lab = { slots: 2, activeJobs: [], paused: false };
      }
      delete save.alchemy.labTimer;
    }
  }
];
