// Zone and Area Data Structure - MAP-UI-UPDATE
// Separate from UI code for better maintainability

export const ZONES = [
  {
    id: 'peaceful-lands',
    name: 'Peaceful Lands',
    description: 'A serene area perfect for beginners to learn the ways of combat.',
    element: 'nature',
    color: '#4ade80', // Green for nature
    unlockReq: null, // Always unlocked
    areas: [
      { 
        id: 'forest-edge', 
        name: 'Forest Edge', 
        enemy: 'Forest Rabbit', 
        killReq: 5,
        description: 'Gentle creatures roam the forest\'s edge.',
        loot: { stones: 2, meat: 1 }
      },
      { 
        id: 'meadow-path', 
        name: 'Meadow Path', 
        enemy: 'Wild Boar', 
        killReq: 8,
        description: 'Wild boars guard the meadow paths.',
        loot: { stones: 3, meat: 2 }
      },
      { 
        id: 'creek-crossing', 
        name: 'Creek Crossing', 
        enemy: 'River Frog', 
        killReq: 10,
        description: 'Mystical frogs inhabit the creek waters.',
        loot: { stones: 4, herbs: 1 }
      },
      { 
        id: 'flower-field', 
        name: 'Flower Field', 
        enemy: 'Honey Bee', 
        killReq: 12,
        description: 'Giant bees protect their flower fields.',
        loot: { stones: 5, herbs: 2 }
      },
      { 
        id: 'old-oak-grove', 
        name: 'Old Oak Grove', 
        enemy: 'Tree Sprite', 
        killReq: 15,
        description: 'Ancient spirits dwell in the oak grove.',
        loot: { stones: 6, wood: 1 }
      },
      { 
        id: 'mossy-rocks', 
        name: 'Mossy Rocks', 
        enemy: 'Stone Lizard', 
        killReq: 18,
        description: 'Camouflaged lizards blend with mossy stones.',
        loot: { stones: 7, ore: 1 }
      },
      { 
        id: 'babbling-brook', 
        name: 'Babbling Brook', 
        enemy: 'Water Snake', 
        killReq: 20,
        description: 'Serpents glide through the babbling waters.',
        loot: { stones: 8, herbs: 2 }
      },
      { 
        id: 'sunny-clearing', 
        name: 'Sunny Clearing', 
        enemy: 'Grass Wolf', 
        killReq: 25,
        description: 'Pack wolves hunt in the sunny clearings.',
        loot: { stones: 10, meat: 3 }
      },
      { 
        id: 'ancient-ruins', 
        name: 'Ancient Ruins', 
        enemy: 'Ruin Guardian', 
        killReq: 30,
        description: 'Stone guardians protect ancient secrets.',
        loot: { stones: 12, ore: 2 }
      },
      { 
        id: 'forest-heart', 
        name: 'Forest Heart', 
        enemy: 'Forest Spirit', 
        killReq: 40,
        description: 'The forest\'s guardian spirit awaits challengers.',
        loot: { stones: 15, wood: 3, herbs: 3 },
        isBoss: true
      }
    ]
  },
  {
    id: 'dark-woods',
    name: 'Dark Woods',
    description: 'Twisted trees hide dangerous creatures in perpetual shadow.',
    element: 'shadow',
    color: '#8b5cf6', // Purple for shadow
    unlockReq: { zoneId: 'peaceful-lands', areaId: 'forest-heart' },
    areas: [
      { 
        id: 'shadow-path', 
        name: 'Shadow Path', 
        enemy: 'Shadow Wolf', 
        killReq: 50,
        description: 'Wolves made of living shadow prowl the dark paths.',
        loot: { stones: 20, shadowEssence: 1 }
      },
      { 
        id: 'twisted-grove', 
        name: 'Twisted Grove', 
        enemy: 'Dark Treant', 
        killReq: 60,
        description: 'Corrupted tree spirits guard the twisted grove.',
        loot: { stones: 25, darkWood: 1 }
      },
      { 
        id: 'cursed-pond', 
        name: 'Cursed Pond', 
        enemy: 'Cursed Toad', 
        killReq: 70,
        description: 'Poisonous toads inhabit the cursed waters.',
        loot: { stones: 30, poisonGland: 1 }
      },
      { 
        id: 'thorn-thicket', 
        name: 'Thorn Thicket', 
        enemy: 'Thorn Beast', 
        killReq: 80,
        description: 'Beasts covered in razor-sharp thorns.',
        loot: { stones: 35, thornSpike: 1 }
      },
      { 
        id: 'witch-hut', 
        name: 'Witch\'s Hut', 
        enemy: 'Corrupted Familiar', 
        killReq: 90,
        description: 'A witch\'s corrupted familiar guards her abandoned hut.',
        loot: { stones: 40, witchHerb: 1 }
      },
      { 
        id: 'dead-tree-circle', 
        name: 'Dead Tree Circle', 
        enemy: 'Wraith', 
        killReq: 100,
        description: 'Restless spirits circle the dead trees.',
        loot: { stones: 45, spiritEssence: 1 }
      },
      { 
        id: 'nightmare-clearing', 
        name: 'Nightmare Clearing', 
        enemy: 'Nightmare Hound', 
        killReq: 120,
        description: 'Hounds born from nightmares hunt in this clearing.',
        loot: { stones: 50, nightmareCore: 1 }
      },
      { 
        id: 'bone-yard', 
        name: 'Bone Yard', 
        enemy: 'Skeleton Warrior', 
        killReq: 140,
        description: 'Ancient warriors rise from their bone-filled graves.',
        loot: { stones: 55, ancientBone: 1 }
      },
      { 
        id: 'dark-altar', 
        name: 'Dark Altar', 
        enemy: 'Dark Cultist', 
        killReq: 160,
        description: 'Cultists perform dark rituals at the shadow altar.',
        loot: { stones: 60, darkRune: 1 }
      },
      { 
        id: 'shadow-lord-lair', 
        name: 'Shadow Lord\'s Lair', 
        enemy: 'Shadow Lord', 
        killReq: 200,
        description: 'The master of shadows awaits in his dark domain.',
        loot: { stones: 100, shadowCrown: 1, shadowEssence: 5 },
        isBoss: true
      }
    ]
  },
  {
    id: 'mountain-peaks',
    name: 'Mountain Peaks',
    description: 'High altitude challenges await the brave among frozen peaks.',
    element: 'ice',
    color: '#60a5fa', // Blue for ice
    unlockReq: { zoneId: 'dark-woods', areaId: 'shadow-lord-lair' },
    areas: [
      { 
        id: 'rocky-trail', 
        name: 'Rocky Trail', 
        enemy: 'Mountain Goat', 
        killReq: 250,
        description: 'Sure-footed goats navigate the treacherous rocky trails.',
        loot: { stones: 80, mountainHide: 1 }
      },
      { 
        id: 'wind-caves', 
        name: 'Wind Caves', 
        enemy: 'Wind Elemental', 
        killReq: 300,
        description: 'Elemental spirits of wind guard the mountain caves.',
        loot: { stones: 100, windCrystal: 1 }
      },
      { 
        id: 'ice-fields', 
        name: 'Ice Fields', 
        enemy: 'Frost Bear', 
        killReq: 350,
        description: 'Massive bears adapted to the eternal ice fields.',
        loot: { stones: 120, frostPelt: 1 }
      },
      { 
        id: 'crystal-cavern', 
        name: 'Crystal Cavern', 
        enemy: 'Crystal Golem', 
        killReq: 400,
        description: 'Living crystal constructs guard the cavern\'s treasures.',
        loot: { stones: 140, crystalCore: 1 }
      },
      { 
        id: 'eagle-nest', 
        name: 'Eagle\'s Nest', 
        enemy: 'Giant Eagle', 
        killReq: 450,
        description: 'Enormous eagles rule the mountain\'s highest peaks.',
        loot: { stones: 160, eagleFeather: 1 }
      },
      { 
        id: 'storm-peak', 
        name: 'Storm Peak', 
        enemy: 'Lightning Hawk', 
        killReq: 500,
        description: 'Hawks crackling with lightning soar around the storm peak.',
        loot: { stones: 180, stormFeather: 1 }
      },
      { 
        id: 'avalanche-zone', 
        name: 'Avalanche Zone', 
        enemy: 'Ice Titan', 
        killReq: 600,
        description: 'Colossal ice titans trigger devastating avalanches.',
        loot: { stones: 200, titanIce: 1 }
      },
      { 
        id: 'dragon-perch', 
        name: 'Dragon\'s Perch', 
        enemy: 'Young Dragon', 
        killReq: 700,
        description: 'A young dragon has claimed this mountain perch.',
        loot: { stones: 250, dragonScale: 1 }
      },
      { 
        id: 'sky-temple', 
        name: 'Sky Temple', 
        enemy: 'Sky Guardian', 
        killReq: 800,
        description: 'Ancient guardians protect the temple in the clouds.',
        loot: { stones: 300, skyRelic: 1 }
      },
      { 
        id: 'peak-summit', 
        name: 'Peak Summit', 
        enemy: 'Mountain King', 
        killReq: 1000,
        description: 'The legendary Mountain King rules from the highest summit.',
        loot: { stones: 500, mountainCrown: 1, titanIce: 3 },
        isBoss: true
      }
    ]
  }
];

// Helper functions for zone/area management
export function getZoneById(zoneId) {
  return ZONES.find(zone => zone.id === zoneId);
}

export function getAreaById(zoneId, areaId) {
  const zone = getZoneById(zoneId);
  return zone ? zone.areas.find(area => area.id === areaId) : null;
}

export function getNextArea(zoneId, areaId) {
  const zone = getZoneById(zoneId);
  if (!zone) return null;
  
  const currentIndex = zone.areas.findIndex(area => area.id === areaId);
  if (currentIndex === -1 || currentIndex === zone.areas.length - 1) return null;
  
  return zone.areas[currentIndex + 1];
}

export function getNextZone(zoneId) {
  const currentIndex = ZONES.findIndex(zone => zone.id === zoneId);
  if (currentIndex === -1 || currentIndex === ZONES.length - 1) return null;
  
  return ZONES[currentIndex + 1];
}

export function isZoneUnlocked(zoneId, gameState) {
  const zone = getZoneById(zoneId);
  if (!zone) return false;
  
  // First zone is always unlocked
  if (!zone.unlockReq) return true;
  
  // Check if unlock requirements are met
  const { zoneId: reqZoneId, areaId: reqAreaId } = zone.unlockReq;
  const reqAreaKey = `${reqZoneId}-${reqAreaId}`;
  
  return gameState.adventure?.areaProgress?.[reqAreaKey]?.bossDefeated || false;
}

export function isAreaUnlocked(zoneId, areaId, gameState) {
  const zone = getZoneById(zoneId);
  if (!zone) return false;
  
  const areaIndex = zone.areas.findIndex(area => area.id === areaId);
  if (areaIndex === -1) return false;
  
  // First area of unlocked zones is always unlocked
  if (areaIndex === 0) return isZoneUnlocked(zoneId, gameState);
  
  // Check if previous area boss was defeated
  const prevArea = zone.areas[areaIndex - 1];
  const prevAreaKey = `${zoneId}-${prevArea.id}`;
  
  return gameState.adventure?.areaProgress?.[prevAreaKey]?.bossDefeated || false;
}
