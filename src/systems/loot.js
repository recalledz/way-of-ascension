import { rollWeaponDropForZone } from '../data/lootTables.weapons.js';
import { ZONES } from '../data/zones.js';

export function onEnemyDefeated(state){
  const zoneKey = state.world?.zoneKey ?? ZONES.STARTING;

  const weaponDrop = rollWeaponDropForZone(zoneKey);
  if (weaponDrop) {
    state.inventory.items.push(weaponDrop);
    state.log.push(`You found: ${weaponDrop.name}.`);
  }

  // … add other rewards (xp, coins) as you already do
}
