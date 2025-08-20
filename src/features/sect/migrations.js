export const migrations = [
  save => {
    if(!save.buildings){
      save.buildings = {};
    }
  }
];
