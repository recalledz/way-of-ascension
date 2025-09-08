export const migrations = [
  (save) => {
    save.tutorial = save.tutorial || {};
    if (save.tutorial.usedAbility === undefined) {
      save.tutorial.usedAbility = false;
    }
  }
];
