import { RINGS } from './data/rings.js';
import { MODIFIERS, MODIFIER_KEYS } from '../gearGeneration/data/modifiers.js';

function rollMinorModifiers() {
  const count = Math.floor(Math.random() * 3); // 0-2
  const keys = [...MODIFIER_KEYS];
  const mods = [];
  for (let i = 0; i < count && keys.length; i++) {
    const idx = Math.floor(Math.random() * keys.length);
    const key = keys.splice(idx, 1)[0];
    mods.push({ key, ...MODIFIERS[key] });
  }
  return mods;
}

function applyRingModifiers(ring, mods) {
  for (const mod of mods) {
    switch (mod.lane) {
      case 'armor':
        ring.protection = ring.protection || {};
        ring.protection.armor = Math.round((ring.protection.armor || 0) + mod.value * 100);
        break;
      case 'dodge':
        ring.protection = ring.protection || {};
        ring.protection.dodge = Math.round((ring.protection.dodge || 0) + mod.value * 100);
        break;
      case 'accuracy':
        ring.offense = ring.offense || {};
        ring.offense.accuracy = Math.round((ring.offense.accuracy || 0) + mod.value * 100);
        break;
      case 'damage':
        ring.bonuses = ring.bonuses || {};
        ring.bonuses.damageMult = (ring.bonuses.damageMult || 0) + mod.value;
        break;
    }
  }
}

export function generateRing(baseKey) {
  const base = RINGS[baseKey];
  if (!base) throw new Error(`Unknown ring: ${baseKey}`);
  const ring = JSON.parse(JSON.stringify(base));
  const mods = rollMinorModifiers();
  applyRingModifiers(ring, mods);
  ring.modifiers = mods.map(m => m.key);
  return ring;
}
