export const activitiesState = {
  activities: {
    cultivation: false,
    physique: false,
    mining: false,
    adventure: false,
    cooking: false,
  },
  physique: { level: 1, exp: 0, expMax: 100, stamina: 100, maxStamina: 100 },
  mining: {
    level: 1,
    exp: 0,
    expMax: 100,
    unlockedResources: ['stones'],
    selectedResource: 'stones',
    resourcesGained: 0,
  },
  cooking: { level: 1, exp: 0, expMax: 100 },
};
