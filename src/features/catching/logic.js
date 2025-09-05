import { ZONES } from '../adventure/data/zones.js';

const iconMap = {
  'Forest Rabbit': '🐇',
  'Wild Boar': '🐗',
  'River Frog': '🐸',
  'Honey Bee': '🐝',
  'Tree Sprite': '🌳',
  'Stone Lizard': '🦎',
  'Water Snake': '🐍',
  'Grass Wolf': '🐺',
  'Ruin Guardian': '🗿',
  'Forest Spirit': '👻',
};

export function getCatchChance(areaIndex) {
  return Math.pow(0.8, areaIndex);
}

export function attemptCatch(state, zoneIndex, areaIndex) {
  const zone = ZONES[zoneIndex];
  const area = zone?.areas?.[areaIndex];
  if (!area) return { success: false };
  const chance = getCatchChance(areaIndex);
  if (Math.random() < chance) {
    const creature = {
      id: `${area.id}-${Date.now()}`,
      name: area.enemy,
      icon: iconMap[area.enemy] || '❓',
      hunger: 100,
      tameProgress: 0,
      tameCooldown: 0,
      tamed: false,
    };
    state.catching.creatures.push(creature);
    return { success: true, creature };
  }
  return { success: false };
}

export function feedCreature(creature) {
  creature.hunger = 100;
  creature.tameProgress = Math.min(100, (creature.tameProgress || 0) + 20);
}

export function attemptTame(creature) {
  if (creature.tameCooldown > 0) return { ok: false };
  creature.tameCooldown = 60 * 60 * 1000; // 1 hour
  const chance = (creature.tameProgress || 0) / 100;
  if (Math.random() < chance) {
    creature.tamed = true;
    return { ok: true, success: true };
  }
  return { ok: true, success: false };
}

export function tickCatching(state, stepMs) {
  const list = state.catching?.creatures;
  if (!list) return;
  const hungerRate = 20 / (3 * 60 * 60 * 1000);
  for (const c of list) {
    c.hunger = Math.max(0, c.hunger - hungerRate * stepMs);
    c.tameCooldown = Math.max(0, (c.tameCooldown || 0) - stepMs);
  }
}
