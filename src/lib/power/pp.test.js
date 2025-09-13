import assert from 'assert';
import { Snapshot, idleDPS } from './pp.js';

// Crit is applied before defenses
{
  const snap = Snapshot({
    weapon: { phys: 100 },
    critChance: 1,
    critMult: 2,
    armor: 50,
  });
  assert.equal(idleDPS(snap), 150);
  assert.notEqual(idleDPS(snap), (100 - 50) * 2);
}

// Global% bucket applied once after summed damage
{
  const snap = Snapshot({
    weapon: { phys: 100, fire: 100 },
    armor: 50,
    globalPct: 0.5,
  });
  assert.equal(idleDPS(snap), 150);
}

// Only weapon flats change DPS; non-weapon flats ignored
{
  const base = Snapshot({ weapon: { phys: 100 } });
  const withNonWeapon = Snapshot({ weapon: { phys: 100 }, nonWeaponFlat: { phys: 50 } });
  const withWeapon = Snapshot({ weapon: { phys: 150 } });
  assert.equal(idleDPS(base), 100);
  assert.equal(idleDPS(withNonWeapon), 100);
  assert.equal(idleDPS(withWeapon), 150);
}

console.log('pp tests passed');
