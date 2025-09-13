import assert from 'assert';
import { drFromArmor, dEhpFromHP, dEhpFromDodge, dEhpFromRes } from './ehp.js';

assert.equal(drFromArmor(100), 0.5);
assert.equal(dEhpFromHP(150), 0.5);
assert.equal(Math.round(dEhpFromDodge(0.2) * 100) / 100, 0.25);
assert.equal(dEhpFromRes(0.5), 1);

console.log('ehp tests passed');
