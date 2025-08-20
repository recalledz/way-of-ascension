export const migrations = [
  save => {
    if(save.alchemy && !Object.prototype.hasOwnProperty.call(save.alchemy, 'unlocked')){
      save.alchemy.unlocked = true;
      save.alchemy.knownRecipes = ['qi', 'body', 'ward'];
    }
  }
];
